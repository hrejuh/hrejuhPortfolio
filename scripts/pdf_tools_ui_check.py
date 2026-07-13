from pathlib import Path
from playwright.sync_api import sync_playwright


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(accept_downloads=True)
    page.goto("http://localhost:5173/tools/pdf")
    page.get_by_role("heading", name="PDF Toolkit").wait_for()

    page.set_content('<main>Page one</main><main style="page-break-before:always">Page two</main>')
    source = page.pdf(format="A4")
    page.goto("http://localhost:5173/tools/pdf")
    upload = {"name": "one.pdf", "mimeType": "application/pdf", "buffer": source}
    page.locator('input[type="file"]').set_input_files([upload, {**upload, "name": "two.pdf"}])
    with page.expect_download() as result:
        page.get_by_role("button", name="Merge and download").click()
    assert Path(result.value.path()).stat().st_size > len(source)

    page.get_by_role("button", name="Extract pages").click()
    page.locator('input[type="file"]').set_input_files(upload)
    page.get_by_placeholder("1-3, 6, 9-12").fill("1-2")
    with page.expect_download():
        page.get_by_role("button", name="Extract and download").click()

    page.get_by_role("button", name="Rotate").click()
    page.locator('input[type="file"]').set_input_files(upload)
    page.get_by_role("button", name="180°").click()
    with page.expect_download():
        page.get_by_role("button", name="Rotate and download").click()

    browser.close()
    print("PDF tools UI check passed")
