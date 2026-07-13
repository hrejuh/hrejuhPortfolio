import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def add_authenticator(cdp):
    cdp.send("WebAuthn.enable")
    cdp.send("WebAuthn.addVirtualAuthenticator", {"options": {"protocol": "ctap2", "transport": "internal", "hasResidentKey": True, "hasUserVerification": True, "isUserVerified": True, "automaticPresenceSimulation": True}})


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()
    add_authenticator(context.new_cdp_session(page))

    page.goto("http://localhost:8788/tools")
    page.get_by_role("button", name="Sign in").click()
    with page.expect_download() as recovery_download:
        page.get_by_role("button", name="Create anonymous account").click()
    recovery = json.loads(Path(recovery_download.value.path()).read_text())

    page.goto("http://localhost:8788/tools/vault")
    recovery_input = page.locator('input[type="file"]')
    if recovery_input.count():
        recovery_input.set_input_files({"name": "recovery.json", "mimeType": "application/json", "buffer": json.dumps(recovery).encode()})
    page.get_by_label("Name", exact=True).fill("Example")
    page.get_by_label("Username", exact=True).fill("hello@example.com")
    page.get_by_label("Password", exact=True).fill("correct horse battery staple")
    page.get_by_role("button", name="Save password").click()
    page.get_by_text("Password saved.").wait_for()

    page.get_by_role("button", name="Files & transfer").click()
    page.locator('input[type="file"]').set_input_files({"name": "note.txt", "mimeType": "text/plain", "buffer": b"private transfer"})
    page.get_by_text("File encrypted and stored.").wait_for()
    page.reload()
    page.get_by_role("button", name="Files & transfer").click()
    page.get_by_text("note.txt").wait_for()
    with page.expect_download() as downloaded:
        page.get_by_role("button", name="Download").click()
    assert Path(downloaded.value.path()).read_bytes() == b"private transfer"

    browser.close()
    print("vault end-to-end check passed")
