import React, { memo } from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { getLogger } from '../core';
import { SongProps } from './SongProps';

const log = getLogger('Song');

interface SongPropsExt extends SongProps {
  onEdit: (id?: string) => void;
}

const Song: React.FC<SongPropsExt> = ({ id, title, author, releaseDate, playCount, liked, onEdit }) => {
  return (
    <IonItem className="song" onClick={() => onEdit(id)}>
      <IonLabel>
          <h2>{title}</h2>
          <p>{`Author: ${author}`}</p>
          <p>{`Release Date: ${releaseDate}`}</p>
          <p>{`Play Count: ${playCount}`}</p>
          <p>{`Liked: ${liked ? 'True' : 'False'}`}</p>
      </IonLabel>
    </IonItem>
  );
};

export default memo(Song);
