import json
from pathlib import Path
from playwright.sync_api import sync_playwright


BASE = "http://localhost:8788"


def add_authenticator(context, page):
    cdp = context.new_cdp_session(page)
    cdp.send("WebAuthn.enable")
    cdp.send("WebAuthn.addVirtualAuthenticator", {"options": {"protocol": "ctap2", "transport": "internal", "hasResidentKey": True, "hasUserVerification": True, "isUserVerified": True, "automaticPresenceSimulation": True}})


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(accept_downloads=True, permissions=["clipboard-read", "clipboard-write"])
    page = context.new_page()
    page.set_default_timeout(30_000)
    add_authenticator(context, page)

    page.goto(f"{BASE}/tools/qr")
    page.get_by_label("Text or link").fill("https://hrejuh.com/tools")
    page.locator("canvas").wait_for()
    page.wait_for_function("document.querySelector('canvas').width === 640")
    with page.expect_download() as qr_download:
        page.get_by_role("button", name="Download PNG").click()
    assert Path(qr_download.value.path()).read_bytes().startswith(b"\x89PNG")

    page.goto(f"{BASE}/tools/finance")
    page.get_by_role("button", name="EMI / Loan").click()
    assert page.locator("#emi-t").input_value() == "20"
    page.get_by_role("button", name="Use months").click()
    assert page.locator("#emi-t").input_value() == "240"
    page.get_by_role("button", name="Show amortization schedule").click()
    assert page.locator("tbody tr").count() == 240

    page.goto(f"{BASE}/tools")
    page.get_by_role("button", name="Sign in").click()
    with page.expect_download() as recovery_download:
        page.get_by_role("button", name="Create anonymous account").click()
    recovery = json.loads(Path(recovery_download.value.path()).read_text())
    assert recovery["vaultKey"]

    page.goto(f"{BASE}/tools/vault")
    page.get_by_label("Record name").fill("HDFC card")
    page.get_by_label("Field 1 label").fill("Transaction password")
    page.get_by_label("Field 1 value").fill("correct horse battery staple")
    page.get_by_role("button", name="Add field").click()
    page.get_by_label("Field 2 label").fill("User ID")
    page.get_by_label("Field 2 value").fill("AHAD-42")
    page.get_by_role("button", name="Save record").click()
    page.get_by_text("Record saved.").wait_for()
    page.get_by_role("button", name="Copy Transaction password").click()
    assert page.evaluate("navigator.clipboard.readText()") == "correct horse battery staple"

    page.get_by_role("button", name="Files & transfer").click()
    page.locator('input[type="file"]').set_input_files({"name": "aadhaar.svg", "mimeType": "image/svg+xml", "buffer": b'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="orange"/></svg>'})
    page.get_by_text("Encrypted and stored.").wait_for()
    page.locator('img[src^="blob:"]').wait_for()
    with page.expect_download() as downloaded:
        page.get_by_role("button", name="Download").click()
    assert b"<svg" in Path(downloaded.value.path()).read_bytes()

    page.goto(f"{BASE}/tools/youtube")
    page.get_by_label("Label").fill("Shared Groq")
    page.get_by_label("New key").fill("gsk_secret_cross_device_check")
    page.get_by_role("button", name="Add", exact=True).click()
    page.get_by_text("Key saved securely.").wait_for()
    encrypted = page.evaluate("fetch('/api/vault?id=llm-keys').then(r => r.arrayBuffer()).then(b => Array.from(new Uint8Array(b)))")
    assert b"gsk_secret_cross_device_check" not in bytes(encrypted)

    page.goto(f"{BASE}/tools")
    page.get_by_role("button", name="Account").click()
    page.get_by_role("button", name="Link another device").click()
    code = page.get_by_test_id("pair-code").inner_text()

    second_context = browser.new_context()
    second_page = second_context.new_page()
    second_page.set_default_timeout(30_000)
    add_authenticator(second_context, second_page)
    second_page.goto(f"{BASE}/tools")
    second_page.get_by_role("button", name="Sign in").click()
    second_page.get_by_placeholder("ABCD-EFGH").fill(code)
    second_page.get_by_role("button", name="Continue").click()
    fingerprint = second_page.get_by_test_id("claim-fingerprint").inner_text()
    page.get_by_test_id("owner-fingerprint").wait_for()
    assert page.get_by_test_id("owner-fingerprint").inner_text() == fingerprint
    page.get_by_role("button", name="Approve").click()
    second_page.get_by_role("heading", name="Your account").wait_for()
    second_page.goto(f"{BASE}/tools/youtube")
    second_page.get_by_text("Shared Groq").wait_for()
    second_page.goto(f"{BASE}/tools/vault")
    second_page.get_by_text("HDFC card").wait_for()
    second_context.close()

    page.goto(f"{BASE}/tools/vault")
    page.get_by_text("HDFC card").wait_for()
    page.evaluate("navigator.serviceWorker.ready")
    if not page.evaluate("Boolean(navigator.serviceWorker.controller)"):
        page.reload()
        page.get_by_text("HDFC card").wait_for()
    context.set_offline(True)
    page.reload(wait_until="domcontentloaded")
    page.get_by_text("HDFC card").wait_for()
    page.get_by_role("button", name="Files & transfer").click()
    page.get_by_text("aadhaar.svg").wait_for()

    browser.close()
    print("vault, offline, cross-device key, QR, and finance checks passed")
