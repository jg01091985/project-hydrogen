class TypeSafeValidator {
  validateToolCall(payload) {
    if (!payload || typeof payload !== 'object') return { valid: false, error: 'Payload must be an object' };
    if (!payload.name || typeof payload.name !== 'string') return { valid: false, error: 'Missing or invalid tool name' };
    if (!payload.input || typeof payload.input !== 'object') return { valid: false, error: 'Missing or invalid tool input object' };
    return { valid: true, sanitized: payload };
  }

  validateMeshPacket(packet) {
    if (!packet || typeof packet !== 'object') return { valid: false, error: 'Packet must be an object' };
    if (!packet.nodeId || !packet.payload || !packet.authTag) return { valid: false, error: 'Malformed E2EE mesh packet structure' };
    return { valid: true, sanitized: packet };
  }
}

export const typeSafeValidator = new TypeSafeValidator();
