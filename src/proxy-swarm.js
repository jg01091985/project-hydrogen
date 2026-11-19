import { CONFIG } from './config.js';

class ProxySwarmManager {
  constructor() {
    this.proxies = CONFIG.PROXY_LIST || [];
    this.currentIndex = 0;
    this.healthMap = new Map();
  }

  allocateResidentialProxy() {
    if (this.proxies.length === 0) {
      return { assigned: false, proxy: null, mode: 'direct-egress' };
    }
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    const health = this.healthMap.get(proxy) || { failures: 0, latency: 45 };
    return {
      assigned: true,
      proxy,
      latency: health.latency,
      protocol: proxy.startsWith('socks') ? 'SOCKS5-Residential' : 'HTTPS-Rotator'
    };
  }

  reportProxyHealth(proxy, success, latencyMs = 50) {
    if (!proxy) return;
    const current = this.healthMap.get(proxy) || { failures: 0, latency: latencyMs };
    if (!success) {
      current.failures += 1;
    } else {
      current.latency = Math.round((current.latency * 4 + latencyMs) / 5);
      current.failures = Math.max(0, current.failures - 1);
    }
    this.healthMap.set(proxy, current);
  }

  getSwarmProxyStats() {
    return {
      totalPoolSize: this.proxies.length,
      activeHealthyProxies: this.proxies.filter(p => (this.healthMap.get(p)?.failures || 0) < 3).length
    };
  }
}

export const proxySwarm = new ProxySwarmManager();
