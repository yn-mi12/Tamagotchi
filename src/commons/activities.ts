export const ActivityType ={
    Idle: 'idle',
    Play: 'play',
    Feed: 'feed',
    Delete: 'delete',
    Sleep: 'sleep',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];
//TODO fix this to be enum somehow