import asyncio
from playwright.async_api import async_playwright
import json
import sys
import os

# Set UTF-8 encoding for Windows console
os.environ['PYTHONIOENCODING'] = 'utf-8'

async def test_dashboard():
    async with async_playwright() as p:
        # Launch browser with console logging
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Collect console messages
        console_messages = []
        errors = []
        warnings = []
        network_failures = []
        
        def handle_console(msg):
            console_messages.append({
                'type': msg.type,
                'text': msg.text,
                'location': str(msg.location) if msg.location else 'unknown'
            })
            if msg.type == 'error':
                errors.append(msg.text)
            elif msg.type == 'warning':
                warnings.append(msg.text)
        
        def handle_request_failed(request):
            network_failures.append({
                'url': request.url,
                'method': request.method,
                'failure': 'Request failed'
            })
        
        def handle_response(response):
            if response.status >= 400:
                network_failures.append({
                    'url': response.url,
                    'method': response.request.method,
                    'status': response.status,
                    'statusText': response.status_text
                })
        
        page.on('console', handle_console)
        page.on('requestfailed', handle_request_failed)
        page.on('response', handle_response)
        
        try:
            print('Loading dashboard at http://localhost:3004...')
            # Navigate to dashboard
            await page.goto('http://localhost:3004', wait_until='networkidle', timeout=30000)
            
            # Wait a bit for React to fully load
            await page.wait_for_timeout(3000)
            
            print('Dashboard loaded successfully')
            
            # Test basic functionality
            print('Testing dashboard functionality...')
            
            # Check page content and structure
            page_content = await page.content()
            has_react_root = 'id="root"' in page_content or 'class="App"' in page_content
            
            # Check if main dashboard elements are present
            dashboard_elements = await page.locator('div, main, section').count()
            
            # Look for common React/dashboard patterns
            body_content = await page.locator('body').inner_text()
            
            # Look for settings/config button with various selectors
            settings_selectors = [
                'button[data-testid="settings"]',
                'button[aria-label*="setting" i]',
                'button[title*="setting" i]',
                '.settings-btn',
                '[class*="setting" i]',
                'button:has-text("Settings")',
                'button:has-text("Config")'
            ]
            
            settings_found = False
            for selector in settings_selectors:
                try:
                    count = await page.locator(selector).count()
                    if count > 0:
                        settings_found = True
                        break
                except:
                    continue
            
            # Look for timer widget
            timer_selectors = [
                '[data-testid="timer"]',
                '.timer',
                '[class*="timer" i]',
                'div:has-text("Timer")',
                'div:has-text("00:")',
                '[class*="clock"]'
            ]
            
            timer_found = False
            for selector in timer_selectors:
                try:
                    count = await page.locator(selector).count()
                    if count > 0:
                        timer_found = True
                        break
                except:
                    continue
            
            # Look for quick tasks
            task_selectors = [
                '[data-testid="quick-tasks"]',
                '.quick-tasks',
                '[class*="task" i]',
                'div:has-text("Task")',
                '[class*="todo"]',
                'ul li',
                '.task-list'
            ]
            
            tasks_found = False
            for selector in task_selectors:
                try:
                    count = await page.locator(selector).count()
                    if count > 0:
                        tasks_found = True
                        break
                except:
                    continue
            
            # Try to interact with any buttons found
            interaction_test = False
            all_buttons = await page.locator('button').count()
            if all_buttons > 0:
                try:
                    first_button = page.locator('button').first
                    await first_button.click(timeout=5000)
                    interaction_test = True
                    print('Button interaction successful')
                    await page.wait_for_timeout(1000)
                except Exception as e:
                    print(f'Button interaction failed: {str(e)}')
            
            # Check page title and basic structure
            title = await page.title()
            url = page.url
            
            # Capture final state
            await page.wait_for_timeout(2000)
            
            # Report results
            print(f'\nTest Results:')
            print(f'Page Title: {title}')
            print(f'Final URL: {url}')
            print(f'React Root Present: {has_react_root}')
            print(f'DOM Elements Count: {dashboard_elements}')
            print(f'Settings Button: {settings_found}')
            print(f'Timer Widget: {timer_found}')
            print(f'Quick Tasks: {tasks_found}')
            print(f'Button Count: {all_buttons}')
            print(f'Interaction Test: {interaction_test}')
            
            # Show some page content for debugging
            print(f'\nPage Content Preview:')
            preview = body_content[:300] + '...' if len(body_content) > 300 else body_content
            print(f'Body text: {preview}')
            
            print(f'\nConsole Messages: {len(console_messages)}')
            print(f'Errors: {len(errors)}')
            print(f'Warnings: {len(warnings)}')
            print(f'Network Issues: {len(network_failures)}')
            
            if errors:
                print(f'\nJavaScript Errors Found:')
                for i, error in enumerate(errors, 1):
                    print(f'{i}. {error}')
            
            if warnings:
                print(f'\nJavaScript Warnings:')
                for i, warning in enumerate(warnings, 1):
                    print(f'{i}. {warning}')
            
            if network_failures:
                print(f'\nNetwork Issues:')
                for i, failure in enumerate(network_failures, 1):
                    print(f'{i}. {failure["method"]} {failure["url"]} - {failure.get("failure", f"HTTP {failure.get("status", "Unknown")}")}')
            
            # Show all console messages for debugging
            if console_messages:
                print(f'\nAll Console Messages:')
                for i, msg in enumerate(console_messages, 1):
                    print(f'{i}. [{msg["type"].upper()}] {msg["text"]} (at {msg["location"]})')
            
            if len(errors) == 0 and len(network_failures) == 0:
                print('\nNo critical runtime errors detected!')
                return True
            else:
                print(f'\nFound {len(errors)} errors and {len(network_failures)} network issues')
                return False
            
        except Exception as e:
            print(f'Test failed: {str(e)}')
            errors.append(f'Page load failed: {str(e)}')
            return False
        
        finally:
            await browser.close()

# Run the test
if __name__ == '__main__':
    result = asyncio.run(test_dashboard())
    sys.exit(0 if result else 1)