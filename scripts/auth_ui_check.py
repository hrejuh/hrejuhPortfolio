from playwright.sync_api import sync_playwright


def check(signed_in: bool) -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()

        def auth(route):
            body = route.request.post_data or ""
            if signed_in and '"op":"session"' in body:
                route.fulfill(status=200, content_type="application/json", body='{"userId":"hj_demo1234567890","deviceCount":2}')
            else:
                route.fulfill(status=400, content_type="application/json", body='{"error":"Please sign in again."}')

        page.route("**/api/auth", auth)
        page.goto("http://127.0.0.1:5173/tools")
        page.wait_for_load_state("networkidle")

        page.get_by_role("button", name="Account" if signed_in else "Sign in").click()
        dialog = page.get_by_role("dialog")
        assert dialog.is_visible()
        if signed_in:
            assert dialog.get_by_text("hj_demo1234567890").is_visible()
            assert dialog.get_by_role("button", name="Add another device").is_visible()
            assert dialog.get_by_role("button", name="Sign out").is_visible()
        else:
            assert dialog.get_by_role("button", name="Sign in with a passkey").is_visible()
            assert dialog.get_by_role("button", name="Create anonymous account").is_visible()
            assert dialog.get_by_role("button", name="Use recovery file").is_visible()
        browser.close()


if __name__ == "__main__":
    check(False)
    check(True)
    print("auth UI checks passed")
