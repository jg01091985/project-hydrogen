class UpstreamURLSentinel {
  constructor() {
    this.endpoints = [
      { name: 'Gemini Web', url: 'https://gemini.google.com', active: true },
      { name: 'AI Studio', url: 'https://aistudio.google.com', active: false },
      { name: 'Backup Gateway', url: 'https://bard.google.com', active: false }
    ];
  }

  getActiveEndpoint() {
    const active = this.endpoints.find(e => e.active);
    return active ? active.url : this.endpoints[0].url;
  }

  async probeAndHeal(customUrl) {
    if (customUrl) {
      this.endpoints.unshift({ name: 'Custom Endpoint', url: customUrl, active: true });
      return customUrl;
    }
    for (const ep of this.endpoints) {
      try {
        if (ep.url.startsWith('https://')) {
          this.endpoints.forEach(e => e.active = (e.url === ep.url));
          return ep.url;
        }
      } catch (e) {}
    }
    return this.endpoints[0].url;
  }
}

export const urlSentinel = new UpstreamURLSentinel();
