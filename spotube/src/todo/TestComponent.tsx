import React, { useState } from 'react';
import { IonButton, IonActionSheet, IonContent } from '@ionic/react';

const ExampleComponent: React.FC = () => {
    const [showActionSheet, setShowActionSheet] = useState(false);

    return (
        <IonContent>
            <IonButton onClick={() => setShowActionSheet(true)}>Open Action Sheet</IonButton>

            <IonActionSheet
                isOpen={showActionSheet}
                onDidDismiss={() => setShowActionSheet(false)}
                buttons={[
                    {
                        text: 'Option 1',
                        handler: () => {
                            console.log('Option 1 selected');
                        },
                    },
                    {
                        text: 'Option 2',
                        handler: () => {
                            console.log('Option 2 selected');
                        },
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked');
                        },
                    },
                ]}
            />
        </IonContent>
    );
};

export default ExampleComponent;
