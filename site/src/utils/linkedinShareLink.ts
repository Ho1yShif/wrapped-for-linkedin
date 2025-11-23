/**
 * Utility to generate LinkedIn share links with prefilled content
 * Note: LinkedIn restricts direct text prefilling for security reasons.
 * The generated link will direct users to LinkedIn where they can post.
 * Text can be copied to clipboard separately.
 */

/**
 * Get the application URL for sharing
 * In production, this should be your deployed app URL
 */

const shareUrl = 'https://www.linkedin.com/feed/?shareActive=true&text=%F0%9F%8E%81%20My%20LinkedIn%20Wrapped%20is%20here!%20This%20year%20brought%20incredible%20insights,%20meaningful%20connections,%20and%20inspiring%20conversations.%20Here%27s%20to%20another%20year%20of%20growth%20and%20community!%0A%0AGet%20your%20LinkedIn%20Wrapped%20here:%20[actual-url-here]%0A%0A%23LinkedInWrapped%20%23ProfessionalGrowth';

function getAppUrl(): string {
  // Check if we're in development or production
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    return `http://${window.location.host}`;
  }

  // In production, use the current origin
  return window.location.origin;
}

/**
 * Generate a LinkedIn share URL
 * LinkedIn's sharing endpoint supports URL and summary parameters
 *
 * @param appUrl Optional custom app URL to share. Defaults to current origin.
 * @param summary Optional summary text (note: LinkedIn may not display this in all interfaces)
 * @returns The LinkedIn share URL
 */
export function generateLinkedInShareUrl(appUrl?: string, summary?: string): string {
  const baseUrl = appUrl || getAppUrl();
  const params = new URLSearchParams();

  // Add the app URL to share
  params.append('url', baseUrl);

  // Add summary if provided (limited support)
  if (summary) {
    params.append('summary', summary.substring(0, 300)); // LinkedIn limits summary length
  }

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Open LinkedIn share dialog in a new window
 * Users will see the app preview and can add their own text
 *
 * @param appUrl Optional custom app URL to share
 * @param summary Optional summary text
 * @param windowName Optional name for the window
 */
export function openLinkedInShare(
  appUrl?: string,
  summary?: string,
  windowName: string = 'linkedin-share'
): Window | null {

  // Open in new tab
  return window.open(shareUrl, '_blank');
}

/**
 * Generate a pre-filled LinkedIn share URL using the LinkedIn Share endpoint
 * This is the primary method for sharing wrapped content
 *
 * @returns Object with shareUrl and instructions
 */
export function getLinkedInShareConfig(): {
  shareUrl: string;
  instructions: string;
  appUrl: string;
} {
  const appUrl = getAppUrl();
  const shareUrl = generateLinkedInShareUrl(appUrl);

  return {
    appUrl,
    shareUrl,
    instructions: 'Click the button below to share on LinkedIn. Copy the prepared text to add context to your post.',
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
