import React, {useState} from "react";
import {createAnimation, IonButton, IonImg, IonModal} from "@ionic/react";

export const PhotoModal: React.FC<{base64Data: string}> = ({base64Data}) => {
    const [showModal, setShowModal] = useState(false);

    const enterAnime = (baseEl: any) => {
        const backdropAnime = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop'))
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnime = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper'))
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ])

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnime, wrapperAnime]);
    }

    const leaveAnime = (baseEl: any) => {
        return enterAnime(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal isOpen={showModal} enterAnimation={enterAnime} leaveAnimation={leaveAnime}>
                <IonImg src={"data:image/jpeg;base64," + base64Data}/>
                <IonButton onClick={() => setShowModal(false)}>Close Photo</IonButton>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)} disabled={(base64Data ?? "") === ""}>View Photo</IonButton>
        </>
    );
}