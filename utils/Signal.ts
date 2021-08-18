class Signal<T> {
    private slots: Map<any, Set<(data: T) => void>> = new Map();
    private once: Map<any, Set<(data: T) => void>> = new Map();

    public add(slot: (data: T) => void, context?: any): void {
        this.addSlot(this.slots, slot, context || this);
    }

    public addOnce(slot: (data: T) => void, context?: any): void {
        this.addSlot(this.once, slot, context || this);
    }

    private addSlot(target: Map<any, Set<(data: T) => void>>, slot: (data: T) => void, context: any = this): void {
        if (!target.has(context)) {
            target.set(context, new Set());
        }
        target.get(context).add(slot);
    }

    public remove(slot: (data: T) => void, context?: any): void {
        this.removeSlot(this.slots, slot, context || this);
        this.removeSlot(this.once, slot, context || this);
    }

    private removeSlot(target: Map<any, Set<(data: T) => void>>, slot: (data: T) => void, context: any = this): void {
        if (target.has(context)) {
            target.get(context).delete(slot);
            if (target.get(context).size === 0) {
                target.get(context).clear();
            }
        }
    }

    public removeAll(): void {
        this.slots.clear();
        this.once.clear();
    }

    public dispatch(data: T): void {
        this.slots.forEach((arr, key) => {
            arr.forEach(slot => {
                slot.call(key, data);
            });
        });
        this.once.forEach((arr, key) => {
            arr.forEach(slot => {
                slot.call(key, data);
            });
        });
        this.once.clear();
    }

}

export default Signal;
