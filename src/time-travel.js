class TimeTravelReplayer {
  constructor() {
    this.timeline = [];
  }

  recordState(actionName, stateSnapshot) {
    const entry = {
      id: this.timeline.length + 1,
      actionName,
      timestamp: Date.now(),
      stateSnapshot: JSON.parse(JSON.stringify(stateSnapshot))
    };
    this.timeline.push(entry);
    return entry.id;
  }

  jumpTo(eventId) {
    const target = this.timeline.find(e => e.id === eventId);
    if (!target) return { success: false, error: 'Event ID not found' };
    return { success: true, restoredState: target.stateSnapshot, eventId };
  }

  getTimeline() {
    return { totalEvents: this.timeline.length, events: this.timeline };
  }
}

export const timeTravel = new TimeTravelReplayer();
