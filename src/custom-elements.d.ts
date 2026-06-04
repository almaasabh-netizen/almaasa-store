export {};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'behold-widget': { 'feed-id': string; className?: string };
      }
    }
  }
}
