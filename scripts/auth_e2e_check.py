import json
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout


def add_authenticator(cdp):
    return cdp.send("WebAuthn.addVirtualAuthenticator", {
        "options": {
            "protocol": "ctap2",
            "transport": "internal",
            "hasResidentKey": True,
            "hasUserVerification": True,
            "isUserVerified": True,
            "automaticPresenceSimulation": True,
        }
    })["authenticatorId"]


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30_000)
    cdp = context.new_cdp_session(page)
    cdp.send("WebAuthn.enable")
    first_authenticator = add_authenticator(cdp)

    page.goto("http://localhost:5173/tools")
    page.wait_for_load_state("domcontentloaded")
    page.get_by_role("button", name="Sign in").click()

    try:
        with page.expect_download() as recovery_download:
            page.get_by_role("button", name="Create anonymous account").click()
    except PlaywrightTimeout:
        print(page.get_by_role("dialog").inner_text())
        raise
    recovery = json.loads(Path(recovery_download.value.path()).read_text())
    page.get_by_role("heading", name="Your account").wait_for()
    assert recovery["site"] == "hrejuh.com"
    assert len(recovery["recoveryKey"]) >= 40
    assert len(recovery["vaultKey"]) >= 40
    assert any(cookie["name"] == "hj_session" and cookie["httpOnly"] for cookie in context.cookies())

    page.get_by_role("button", name="Sign out").click()
    page.get_by_role("button", name="Sign in with a passkey").click()
    page.get_by_role("heading", name="Your account").wait_for()

    page.get_by_role("button", name="Link another device").click()
    code = page.get_by_test_id("pair-code").inner_text()
    second_context = browser.new_context()
    second_page = second_context.new_page()
    second_cdp = second_context.new_cdp_session(second_page)
    second_cdp.send("WebAuthn.enable")
    add_authenticator(second_cdp)
    second_page.goto("http://localhost:5173/tools")
    second_page.get_by_role("button", name="Sign in").click()
    second_page.get_by_placeholder("ABCD-EFGH").fill(code)
    second_page.get_by_role("button", name="Continue").click()
    fingerprint = second_page.get_by_test_id("claim-fingerprint").inner_text()
    page.get_by_test_id("owner-fingerprint").wait_for()
    assert page.get_by_test_id("owner-fingerprint").inner_text() == fingerprint
    page.get_by_role("button", name="Approve").click()
    second_page.get_by_role("heading", name="Your account").wait_for()
    assert any(cookie["name"] == "hj_session" and cookie["httpOnly"] for cookie in second_context.cookies())
    second_page.goto("http://localhost:5173/tools/vault")
    second_page.get_by_role("button", name="Passwords").wait_for()
    second_context.close()

    cdp.send("WebAuthn.removeVirtualAuthenticator", {"authenticatorId": first_authenticator})
    add_authenticator(cdp)
    page.get_by_role("button", name="Add a passkey on this device").click()
    page.get_by_text("3 registered passkeys").wait_for()

    page.get_by_role("button", name="Sign out").click()
    recovery_input = page.locator('input[type="file"]')
    with page.expect_download() as replacement_download:
        recovery_input.set_input_files({"name": "hrejuh-recovery-key.txt", "mimeType": "text/plain", "buffer": json.dumps(recovery).encode()})
    replacement = json.loads(Path(replacement_download.value.path()).read_text())
    assert replacement["recoveryKey"] != recovery["recoveryKey"]

    page.get_by_role("button", name="Sign out").click()
    recovery_input.set_input_files({"name": "old-recovery.txt", "mimeType": "text/plain", "buffer": json.dumps(recovery).encode()})
    page.get_by_text("Recovery file not recognized.").wait_for()

    browser.close()
    print("auth end-to-end checks passed")
