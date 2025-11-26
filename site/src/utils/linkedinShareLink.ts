/**
 * Utility to generate LinkedIn share links with prefilled content
 * Note: LinkedIn restricts direct text prefilling for security reasons.
 * The generated link will direct users to LinkedIn where they can post.
 * Text can be copied to clipboard separately.
 */

/**
 * Current year for share text
 */
const currentYear = new Date().getFullYear();

/**
 * Generate a LinkedIn share URL with prefilled text based on card data
 *
 * @param impressions Optional impressions value from card data
 * @param membersReached Optional members reached value from card data
 * @returns The LinkedIn share URL with prefilled text
 */
export function generateLinkedInShareUrl(
  impressions?: string | number,
  membersReached?: string | number
): string {
  // App URL will be hardcoded after deployment
  const appUrl = 'https://linkedin-wrapped.onrender.com/';

  // Build share URL with prefilled text
  const shareUrlWithText = `https://www.linkedin.com/feed/?shareActive=true&text=%F0%9F%8E%81%20Just%20got%20my%20LinkedIn%20Wrapped%20for%20${currentYear}!%0A%0AThis%20year%3A%20${impressions || 0}%20impressions%2C%20${membersReached || 0}%20people%20reached%2C%20and%20countless%20connections%20that%20mattered.%0A%0AWhat%27s%20your%20LinkedIn%20story%3F%20Get%20yours%20here%3A%20${appUrl}%0A%0A%23LinkedInWrapped%20%23${currentYear}Recap`;

  return shareUrlWithText;
}

/**
 * Open LinkedIn share dialog in a new window
 * Users will see the prefilled share text and can add their own comments
 *
 * @param impressions Optional impressions value from card data
 * @param membersReached Optional members reached value from card data
 */
export function openLinkedInShare(
  impressions?: string | number,
  membersReached?: string | number
): Window | null {
  const shareUrl = generateLinkedInShareUrl(impressions, membersReached);
  return window.open(shareUrl, '_blank');
}

/**
 * Generate a pre-filled LinkedIn share URL using the LinkedIn Share endpoint
 * This is the primary method for sharing wrapped content
 *
 * @param impressions Optional impressions value from card data
 * @param membersReached Optional members reached value from card data
 * @returns Object with shareUrl and instructions
 */
export function getLinkedInShareConfig(
  impressions?: string | number,
  membersReached?: string | number
): {
  shareUrl: string;
  instructions: string;
} {
  const generatedShareUrl = generateLinkedInShareUrl(impressions, membersReached);

  return {
    shareUrl: generatedShareUrl,
    instructions: 'Click the button below to share on LinkedIn. The text will be copied to your clipboard for posting.',
  };
}

/**
 * Create a complete LinkedIn share action with prefilled text
 * Returns a function that triggers the share and copies text
 *
 * @param shareText The text to copy to clipboard
 * @param onShareClick Optional callback when share is clicked
 * @param onCopySuccess Optional callback when text is copied
 * @param onError Optional error handler
 */
export function createLinkedInShareAction(
  shareText: string,
  onShareClick?: () => void,
  onCopySuccess?: () => void,
  onError?: (error: Error) => void
): () => Promise<void> {
  return async () => {
    try {
      // Copy text to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Trigger callback
      onCopySuccess?.();

      // Open LinkedIn share dialog
      onShareClick?.();
      openLinkedInShare();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to prepare share');
      onError?.(err);
      throw err;
    }
  };
}
