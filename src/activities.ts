export const ActivityType ={
    Idle: 'idle',
    Play: 'play',
    Feed: 'feed',
    Delete: 'delete',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];