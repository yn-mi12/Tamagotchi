export class Pet {
    name: string;
    type: string;
    health: number;
    happiness: number;
    hunger: number;
    currentActivity?: String;

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
        this.health = 20;
        this.happiness = 20;
        this.hunger = 0;
        this.currentActivity = "idle";
    }
    
    performActivity(activity: String) {
        switch (activity) {
            case "play":
                this.happiness = Math.min(20, this.happiness + 1);
                this.hunger = Math.min(20, this.hunger + 1);
                this.currentActivity = "play";
                console.log(`${this.name} is playing.`);
                break;
            case "feed":
                this.hunger = Math.max(0, this.hunger - 1);
                this.health = Math.min(20, this.health + 1);
                this.currentActivity = "feed";
                console.log(`${this.name} is eating.`);
                break;
            case "idle":
                this.hunger = Math.min(20, this.hunger + 1);
                this.happiness = Math.max(0, this.happiness - 1);
                this.health = Math.max(0, this.health - 1);
                this.currentActivity = "idle";
                console.log(`${this.name} is idling.`);
                break;
            case "sleep":
                this.health = Math.min(20, this.health + 2);
                this.hunger = Math.min(20, this.hunger + 1);
                this.currentActivity = "sleep";
                console.log(`${this.name} is sleeping.`);
                break;
            default:
                break;
        }
    }
}