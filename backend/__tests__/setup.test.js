// ABOUTME: Test to verify setup file is working correctly
// ABOUTME: Basic health check test for test environment configuration

describe('Test Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NOTION_TOKEN).toBe('test_token_mock');
  });

  it('should have global test utilities available', () => {
    expect(global.mockNotionResponse).toBeDefined();
    expect(global.mockTaskPage).toBeDefined();
    expect(global.mockNotionClient).toBeDefined();
  });
});