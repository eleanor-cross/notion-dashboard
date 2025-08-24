import asyncio
from playwright.async_api import async_playwright
import json
import sys
import os

# Set UTF-8 encoding for Windows console
os.environ['PYTHONIOENCODING'] = 'utf-8'

async def detailed_dashboard_test():
    async with async_playwright() as p:
        # Launch browser with console logging
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Collect detailed console messages
        console_messages = []
        errors = []
        warnings = []
        network_requests = []
        network_failures = []
        
        def handle_console(msg):
            full_msg = {
                'type': msg.type,
                'text': msg.text,
                'location': str(msg.location) if msg.location else 'unknown',
                'args': [str(arg) for arg in msg.args] if msg.args else []
            }
            console_messages.append(full_msg)
            
            if msg.type == 'error':
                errors.append(full_msg)
            elif msg.type == 'warning':
                warnings.append(full_msg)
        
        def handle_request(request):
            network_requests.append({
                'url': request.url,
                'method': request.method,
                'headers': dict(request.headers),
                'timestamp': None  # Playwright doesn't provide timestamp easily
            })
        
        def handle_request_failed(request):
            network_failures.append({
                'url': request.url,
                'method': request.method,
                'failure': 'Request failed',
                'headers': dict(request.headers)
            })
        
        def handle_response(response):
            if response.status >= 400:
                network_failures.append({
                    'url': response.url,
                    'method': response.request.method,
                    'status': response.status,
                    'statusText': response.status_text,
                    'headers': dict(response.headers)
                })
        
        # Add event listeners
        page.on('console', handle_console)
        page.on('request', handle_request)
        page.on('requestfailed', handle_request_failed)
        page.on('response', handle_response)
        
        try:
            print('Starting detailed dashboard test...')
            
            # Navigate to dashboard with longer timeout
            print('Loading dashboard...')
            await page.goto('http://localhost:3004', wait_until='networkidle', timeout=30000)
            
            # Wait for React to fully mount
            await page.wait_for_timeout(5000)
            
            print('Dashboard loaded. Analyzing...')
            
            # Get page source for analysis
            page_content = await page.content()
            
            # Check for React errors more specifically
            react_errors = await page.locator('[data-reactroot] [role="alert"], .react-error-boundary, [class*="error"]').count()
            
            # Look for the actual QuickTasks component
            quick_tasks_container = await page.locator('[class*="QuickTasks"], .quick-tasks, [data-testid="quick-tasks"]').count()
            
            # Try to find any visible buttons or interactive elements
            buttons = await page.locator('button').count()
            interactive_elements = await page.locator('input, select, textarea, button').count()
            
            # Check if we can see any error boundaries or React dev warnings
            react_warnings = [msg for msg in console_messages if 'react' in msg['text'].lower() or 'error boundary' in msg['text'].lower()]
            
            # Try to interact with the page more
            if buttons > 0:
                print(f'Found {buttons} buttons. Testing interactions...')
                button_texts = await page.locator('button').all_text_contents()
                print(f'Button texts: {button_texts}')
            
            # Get more specific error information
            js_errors = [msg for msg in console_messages if msg['type'] == 'error']
            
            # Wait a bit more to catch any delayed errors
            await page.wait_for_timeout(3000)
            
            # Final analysis
            print('\n=== DETAILED TEST RESULTS ===')
            print(f'Total network requests: {len(network_requests)}')
            print(f'Network failures: {len(network_failures)}')
            print(f'Console messages: {len(console_messages)}')
            print(f'JavaScript errors: {len(js_errors)}')
            print(f'React warnings: {len(react_warnings)}')
            print(f'Buttons found: {buttons}')
            print(f'Interactive elements: {interactive_elements}')
            print(f'QuickTasks containers: {quick_tasks_container}')
            print(f'React error boundaries: {react_errors}')
            
            # Print network requests
            if network_requests:
                print('\n=== NETWORK REQUESTS ===')
                for i, req in enumerate(network_requests[:10], 1):  # Limit to first 10
                    print(f'{i}. {req["method"]} {req["url"]}')
            
            # Print network failures
            if network_failures:
                print('\n=== NETWORK FAILURES ===')
                for i, failure in enumerate(network_failures, 1):
                    status_info = f'HTTP {failure.get("status", "Unknown")}' if 'status' in failure else failure.get('failure', 'Unknown error')
                    print(f'{i}. {failure["method"]} {failure["url"]} - {status_info}')
            
            # Print JavaScript errors in detail
            if js_errors:
                print('\n=== JAVASCRIPT ERRORS (DETAILED) ===')
                for i, error in enumerate(js_errors, 1):
                    print(f'{i}. Location: {error["location"]}')
                    print(f'   Error: {error["text"]}')
                    if error['args']:
                        print(f'   Args: {error["args"]}')
                    print('')
            
            # Print React warnings
            if react_warnings:
                print('\n=== REACT WARNINGS ===')
                for i, warning in enumerate(react_warnings, 1):
                    print(f'{i}. {warning["text"]}')
            
            # Print all other console messages for context
            other_messages = [msg for msg in console_messages if msg['type'] not in ['error', 'warning']]
            if other_messages:
                print('\n=== OTHER CONSOLE MESSAGES ===')
                for i, msg in enumerate(other_messages, 1):
                    print(f'{i}. [{msg["type"].upper()}] {msg["text"]}')
            
            # Extract the specific error from React
            component_errors = [msg for msg in console_messages if 'QuickTasks' in msg['text']]
            if component_errors:
                print('\n=== QUICKTASKS COMPONENT ERRORS ===')
                for i, error in enumerate(component_errors, 1):
                    print(f'{i}. {error["text"]}')
                    print(f'   Location: {error["location"]}')
            
            return len(js_errors) == 0 and len(network_failures) == 0
            
        except Exception as e:
            print(f'Test failed with exception: {str(e)}')
            return False
        
        finally:
            await browser.close()

# Run the test
if __name__ == '__main__':
    result = asyncio.run(detailed_dashboard_test())
    print(f'\nTest result: {"PASS" if result else "FAIL"}')
    sys.exit(0 if result else 1)