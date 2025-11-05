export class LogoutUseCase {
  async execute(userId: string): Promise<void> {
    // In a production system, you would:
    // 1. Add the token to a blacklist (Redis)
    // 2. Invalidate refresh tokens
    // 3. Clear any session data

    // For this implementation, client handles token removal
    return;
  }
}
