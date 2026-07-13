import json
from pathlib import Path
from playwright.sync_api import sync_playwright


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

    page.goto("http://127.0.0.1:5173/tools")
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name="Sign in").click()

    with page.expect_download() as recovery_download:
        page.get_by_role("button", name="Create anonymous account").click()
    recovery = json.loads(Path(recovery_download.value.path()).read_text())
    page.get_by_role("heading", name="Your account").wait_for()
    assert recovery["site"] == "hrejuh.com"
    assert len(recovery["recoveryKey"]) >= 40
    assert any(cookie["name"] == "hj_session" and cookie["httpOnly"] for cookie in context.cookies())

    page.get_by_role("button", name="Sign out").click()
    page.get_by_role("button", name="Sign in with a passkey").click()
    page.get_by_role("heading", name="Your account").wait_for()

    cdp.send("WebAuthn.removeVirtualAuthenticator", {"authenticatorId": first_authenticator})
    add_authenticator(cdp)
    page.get_by_role("button", name="Add another device").click()
    page.get_by_text("2 registered passkeys").wait_for()

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
