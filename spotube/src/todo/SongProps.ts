export interface SongProps {
    id?: string,
    title: string,
    author: string,
    releaseDate: Date | undefined,
    playCount: number,
    liked: boolean
}

export const filterSongs = (
    songs: SongProps[],
    titleFilter?: string,
    authorFilter?: string,
    likedFilter?: boolean) => {
    const filterFn = (song: SongProps) =>
        (!titleFilter || song.title.includes(String(titleFilter))) &&
        (!authorFilter || song.author.includes(authorFilter)) &&
        (!likedFilter || song.liked == likedFilter)
    return songs.filter(filterFn);
};