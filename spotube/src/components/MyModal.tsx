import React, { useState } from 'react';
import {createAnimation, IonModal, IonButton, IonContent, IonImg} from '@ionic/react';

export const MyModal: React.FC<{base64Data: string}> = ({base64Data}) => {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const root = baseEl.shadowRoot;
        const backdropAnimation = createAnimation()
            .addElement(root.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(root.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    console.log('MyModal', showModal);
    return (
        <>
            {/*<IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>*/}
            {/*    <p>This is modal content</p>*/}
            {/*    <IonButton onClick={() => setShowModal(false)}>Close Modal</IonButton>*/}
            {/*</IonModal>*/}
            {/*<IonButton onClick={() => setShowModal(true)}>Show Modal</IonButton>*/}
            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <IonImg src={"data:image/jpeg;base64," + base64Data}/>
                <IonButton onClick={() => setShowModal(false)}>Close Photo</IonButton>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)} disabled={(base64Data ?? "") === ""}>View Photo</IonButton>
        </>
    );
};
