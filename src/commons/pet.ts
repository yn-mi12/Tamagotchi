import { ActivityType } from "./activities.ts";

export class Pet {
    name: string;
    type: string;
    health: number;
    happiness: number;
    hunger: number;
    currentActivity?: ActivityType;

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
        this.health = 20;
        this.happiness = 20;
        this.hunger = 0;
        this.currentActivity = ActivityType.Idle;
    }
    
    performActivity(activity: ActivityType) {
        switch (activity) {
            case ActivityType.Play:
                this.happiness = Math.min(20, this.happiness + 1);
                this.hunger = Math.min(20, this.hunger + 1);
                this.currentActivity = ActivityType.Play;
                break;
            case ActivityType.Feed:
                this.hunger = Math.max(0, this.hunger - 1);
                this.health = Math.min(20, this.health + 1);
                this.currentActivity = ActivityType.Feed;
                break;
            case ActivityType.Idle:
                this.hunger = Math.min(20, this.hunger + 1);
                this.happiness = Math.max(0, this.happiness - 1);
                this.health = Math.max(0, this.health - 1);
                this.currentActivity = ActivityType.Idle;
                console.log(`${this.name} is idling.`);
                break;
            case ActivityType.Sleep:
                this.health = Math.min(20, this.health + 2);
                this.hunger = Math.min(20, this.hunger + 1);
                this.currentActivity = ActivityType.Sleep;
                break;
            default:
                break;
        }
    }
}