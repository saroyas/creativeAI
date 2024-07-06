"use client";
import { useState, useEffect } from 'react';
import { ImageCard } from "@/components/image-card";
import { event } from 'nextjs-google-analytics';
import { motion, useMotionValue, useTransform, useDragControls, PanInfo, AnimatePresence } from 'framer-motion';

interface PageProps {
    params: { imageCode: string };
}

export default function Home({ params }: PageProps) {
    const { imageCode } = params;
    const [stack, setStack] = useState([
        "899bc5e6-05ab-43e5-8679-23a854961b04",
        "cf2513b9-00e7-411b-95cc-a292c1ccecac",
        "4a4164f3-0688-4854-b86a-727292d30705",
        "872f9721-4bba-4b89-8e2a-b737bd64239d",
        "101a487c-ab98-4077-9584-19e265ee6913",
        "e513f059-ca8b-4b6e-bd1f-c5cbbdf8cc3d",
        "68cb68e5-d311-4285-873f-aedcf07e1360",
        "0df10121-77c7-417e-a53b-58a32d7642b0",
        "2b538d90-6600-4728-8807-13d9a6aaff7e",
        "00bdef30-e6f5-47d0-bf2e-ca6066397036",
        "4bd47e93-46d0-4980-b4d2-abe26d9c73b3",
        "85040099-cc64-48c7-a286-bf2417263012",
        "d388ab7f-40d0-4bb8-bdd0-64c55f3f6171",
        "005aa716-bf0a-44bf-83e3-045fc5fc3f3f",
        "2714e9cb-b8ec-46be-9a22-a0f7fc735a11",
        "c3b42864-807b-4dac-adba-695522f529aa",
        "cc9404a4-bd41-4143-aac7-c6cc4783f943",
        "bc129308-2608-493a-8ba1-2a8a9415e87a",
        "e86cd848-1f75-44df-b84d-d439cbdaf771",
        "ff92a700-ba84-4637-aecc-059fd68e1c79",
        "84b3ded8-5e9d-4039-abe6-57896d03f33a",
        "47696b6e-da6b-4270-84b6-2c0425dde30a",
        "c41bb59e-f8ee-468a-a019-fa96fbee7cc5",
        "e1a109b4-77a2-4168-854e-3f57a385d1e7",
        "9c835eb1-1fba-46f3-b2c8-87e20e84450d",
        "c3322d43-b737-4b6a-bbb3-1d0d22489af0",
        "90448fdd-e208-4849-b6a7-3e794f8763c1",
        "8fa6b189-8cc3-4f8b-ae3d-c1d7d0951c72",
        "a0b41cce-d8dd-41be-8d70-cc2ed009fd6f",
        "65516bb7-77d0-4628-99ff-c90a20974c5d",
        "583bca13-153f-4889-bba3-c10aeed4d4c1",
        "ec421657-8683-4748-a7b4-ccde2e12bcf2",
        "5a908d2e-c827-4bbb-b7c4-9e081254d601",
        "1e58fd30-3706-4dd9-a0df-82aa77b3e368",
        "9a46a7eb-468f-45dc-9692-5c491ceaa039",
        "36abff4b-4f64-4b81-91bd-87bb2797209b",
        "ca113866-753f-4536-9183-7533ccdd262d",
        "898af136-f4be-4f2e-9b0f-e954ac0efb5a",
        "eb70b744-d487-4153-bd30-b6b9d54ff867",
        "bd9541bd-ae6a-47ae-8401-9e9be79c19bf",
        "ca718cc0-0148-4325-8370-af79cd477ac2",
        "5b1b0ff0-65d7-482d-b2cf-b5aa297078cc",
        "6246aed3-e6de-40a2-9d41-b1d13bd0be7e",
        "856838c2-14e3-438d-9c64-9c002708ce73",
        "8ed9034d-4bc9-4aff-9697-c6071cf87759",
        "85616c7a-48ca-4553-9e98-ed340a895dd6",
        "31b73b16-3e26-45bf-aa69-70c081963725",
        "f4bf8535-da2c-4aeb-8055-88bc73765dba",
        "24f74cfe-4ff2-40cb-bb2f-3743f02f6fc0",
        "5f2ef172-2e25-4f52-a650-a83335c6fdc0",
        "e70b29b7-6993-4b38-ac69-2f52c29166dc",
        "e4f7aa54-5a33-45a0-95ae-b496fcf67211",
        "0df1d1ee-5958-44c9-96b9-26a811b5b01f",
        "b038bd80-0f16-4df6-a964-cd53993552b2",
        "28a1c4c7-7e7e-4082-a76e-7ab4d5d834c7",
        "26898ce2-ca67-49a9-91ba-9d358d28fd03",
        "aa64e441-aebb-42a8-a32f-cbf0e0b0e3c9",
        "b1d32499-25a7-420f-acc7-e08d59f32172",
        "8e539c58-9b95-4e67-bc45-4af3b8194ca6",
        "7c5f032e-fc77-419c-b37a-376dbac23ad1",
        "9f917382-829d-44e2-b6fe-1838b7db00a4",
        "bc8c0dee-afc3-454a-ae5a-96d1066a65f3",
        "f24f6114-8897-4548-802b-fad709c46d3e",
        "7c975421-1329-44ff-aba4-3f19927a598e",
        "6af0f1af-80ea-4b98-9b8d-8ec7fb2fa165",
        "342479c2-91f9-4935-b057-e066b5545962",
        "7822e40f-da22-4ead-a540-745bb38d88db",
        "55c39a51-752d-4232-8d8b-c86378a64b55",
        "f5b2e5f0-8760-4c4d-9dc4-7d71c62c9465",
        "d1772dbf-a38c-4b47-9d17-3a158b2b07ac",
        "6c56cd5f-1baf-490c-abe5-dcc132017def",
        "723ae6b1-c934-43ba-9f7b-861bb8809eec",
        "add6b8fe-eeec-4583-b130-f3181e968424",
        "3c4908bc-b0e4-4d55-a954-94d4a1326d46",
        "58d657c8-b441-4e08-a21d-d2e3f9ad5941",
        "4df2717a-04c5-45f3-9dd7-3b6ebd9a5d7b",
        "3bd37773-109a-45f6-8f2b-064c4f74b26a",
        "964c125a-6673-4cc1-a0f0-2f6b671e01bd",
        "2a5bb1db-cb98-445a-bcc7-935243bcbaa2",
        "579ee77c-6169-4ee3-ba56-476827234368",
        "0771cc22-3e2d-4633-971a-2b66a2d82690",
        "dd042b7d-fdc9-4015-b64c-588eb0669f6a",
        "6294b1d8-fa81-4325-a9ab-ca5f9e345192",
        "727a3a34-33e1-40e4-b1c6-afed1ae4df25",
        "b22058e9-ff87-43a9-8b5a-e57ed236209e",
        "7326bc37-7ffe-4293-ba69-fa891d3d76d0",
        "d551cecd-2a6e-4e67-8882-952002fd8e34",
        "4898c71c-4810-44dc-bf35-c22bc23f4247",
        "708324cd-9164-4ecd-bf85-2b6c7e37e8c3",
        "0be0bae2-a03c-412b-a1c0-23cbb10beade",
        "b52cf176-7ac0-48b2-bee3-faa16d830e97",
        "2cf3ca4a-f1b5-4f28-8f6c-116ff4c69bf4",
        "6aad8312-5b21-4557-bdad-4c97369f02e8",
        "0babf708-f71b-430d-841f-69b0e91f09bf",
        "6aadf683-42c7-40c0-b7ba-11797a50a2af",
        "fde44f49-bcd7-45f9-a4e1-b1249428a3f7",
        "c3357be9-3b71-4307-baba-050fde30abe1",
        "1b8bc615-89fa-4e2d-b587-fb918e287957"
    ]);
    useEffect(() => {
        event('Share_Image_Opened', {
            category: 'Share_Image_Opened',
            label: imageCode ? 'Share_Image_Opened Chat' : 'New Image',
            value: imageCode ? 1 : 0,
        });
    }, [imageCode]);

    const removeCard = () => {
        setStack(current => {
            const [, ...rest] = current;
            return rest;
        });
    };

    return (
        <div className="h-[100dvh] flex flex-col">
            <main className="flex-grow flex items-stretch justify-center">
                <div className="relative w-full h-full">
                    <AnimatePresence initial={false}>
                        {stack.slice(0, 4).map((code, index) => (
                            <Card
                                key={code}
                                imageCode={code}
                                onSwipe={removeCard}
                                index={index}
                                total={4}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
function Card({ imageCode, onSwipe, index, total }: { imageCode: string, onSwipe: () => void, index: number, total: number }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
    const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

    // Calculate the size and position of the glow based on swipe distance
    const leftGlowSize = useTransform(x, [-200, 0], ['50%', '0%']);
    const rightGlowSize = useTransform(x, [0, 200], ['0%', '50%']);
    const leftGlowOpacity = useTransform(x, [-200, 0], [0.7, 0]);
    const rightGlowOpacity = useTransform(x, [0, 200], [0, 0.7]);

    const animControls = {
        initial: { scale: 1, y: 0, opacity: 1 },
        animate: {
            scale: 1 - index * 0.02,
            y: index * -5,
            opacity: 1 - index * 0.1,
            zIndex: total - index,
        },
        transition: { type: "spring", stiffness: 300, damping: 20 }
    };

    const [exitX, setExitX] = useState(0);

    const handleDrag = (event: any, info: PanInfo) => {
        // Update x value as the card is being dragged
        x.set(info.offset.x);
    };

    return (
        <>
            {/* Left swipe glow */}
            <motion.div
                className="absolute inset-y-0 left-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 50% 90% at left, rgba(255, 100, 100, ${leftGlowOpacity.get()}) 0%, transparent 70%)`,
                    width: leftGlowSize,
                }}
            />
            {/* Right swipe glow */}
            <motion.div
                className="absolute inset-y-0 right-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 50% 90% at right, rgba(100, 255, 100, ${rightGlowOpacity.get()}) 0%, transparent 70%)`,
                    width: rightGlowSize,
                }}
            />
            <motion.div
                className="absolute inset-0"
                style={{ x, rotate, opacity }}
                drag={index === 0 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDrag={handleDrag}
                onDragEnd={(_, { offset, velocity }) => {
                    const swipe = offset.x * velocity.x;
                    if (Math.abs(swipe) > 20000 || Math.abs(offset.x) > 100) {
                        setExitX(offset.x > 0 ? 1000 : -1000);
                        onSwipe();
                    }
                }}
                {...animControls}
                exit={{
                    x: exitX,
                    opacity: 0,
                    transition: { duration: 0.2 }
                }}
            >
                <ImageCard initialImageCode={imageCode} hidden={index !== 0} />
            </motion.div>
        </>
    );
}