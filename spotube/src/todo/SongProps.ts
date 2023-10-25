export interface SongProps {
    id?: string,
    title: string,
    author: string,
    releaseDate: Date | undefined,
    playCount: number,
    liked: boolean
}