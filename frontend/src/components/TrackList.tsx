import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Image from 'next/image';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { 
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  uri: string;
  played_at?: string;
}

interface Props {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}

export function TrackList({ tracks, onTracksChange }: Props) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onTracksChange(items);
  };
  
  const removeTrack = (index: number) => {
    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    onTracksChange(newTracks);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Sort tracks from oldest to newest
  const sortedTracks = [...tracks].sort((a, b) => {
    if (!a.played_at || !b.played_at) return 0;
    return new Date(a.played_at).getTime() - new Date(b.played_at).getTime();
  });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tracks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {sortedTracks.map((track, index) => (
              <Draggable
                key={track.id}
                draggableId={track.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="flex items-center p-4 bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-600"
                  >
                    {/* Drag Handle */}
                    <div className="mr-4 text-gray-300 cursor-grab">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>

                    {/* Album Cover */}
                    <div className="relative flex-shrink-0 w-16 h-16 mr-4">
                      {track.album.images[0] && (
                        <Image
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          width={64}
                          height={64}
                          className="rounded-md"
                        />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-medium text-white truncate max-w-[70%]">
                          {track.name}
                        </h3>
                        {track.played_at && (
                          <span className="text-xs text-gray-300 ml-2 flex-shrink-0">
                            {formatDate(track.played_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{track.album.name}</p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeTrack(index)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove track"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
