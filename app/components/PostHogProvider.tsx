'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

/**
 * Initializes the PostHog client in the browser and provides it to descendant components via the PostHog React context.
 *
 * Initializes PostHog once on mount using environment-provided configuration and wraps `children` with the PostHog provider.
 *
 * @returns The PostHog React provider element that wraps `children` and supplies the initialized PostHog client.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: 'history_change',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
