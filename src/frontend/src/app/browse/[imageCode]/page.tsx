"use client";
import { useState, useEffect } from 'react';
import { ImageCard } from "@/components/image-card";
import { event } from 'nextjs-google-analytics';
import { motion, useMotionValue, useTransform, useDragControls, PanInfo, AnimatePresence } from 'framer-motion';

const keys = [
    "a1d21a4c-cee6-416f-8aa4-63fc6ff297d3",
    "a7014c95-f0de-47a6-8965-82d005ff5924",
    "28fd28f6-7dbf-4c53-9433-24c736039b5a",
    "45ddd8bf-14b8-459c-b7b0-18b994d16e84",
    "38f0941e-322b-42f0-a06a-80668527c20b",
    "ad562c34-6db1-4c57-9502-2eea6cd7261a",
    "56993ed7-4c83-4589-a84f-ef0336349ccd",
    "536c60df-8beb-433f-931d-982d20ba5eb8",
    "20d58408-1e52-4807-bfbc-9b14e1773aac",
    "62a79ece-207f-4f6f-ae29-b5dc2172a571",
    "8544d6b2-c0b7-4f7b-8c00-5682ba536eec",
    "00874de8-dc58-42ee-8e91-cff7fa88cc37",
    "27acfd59-18cf-4d6f-9403-da55ec000d51",
    "b9fcd82f-1f7d-40ef-8325-0ad6be538874",
    "814c3caa-8105-461c-82d6-72e3f974a114",
    "9b0ee582-695e-49eb-a8c5-8607231efc90",
    "c40423cd-9dc4-4d1e-b3df-759bc11ca0f2",
    "dbdfa726-5414-45c7-a770-4a25c2f2726d",
    "76b75d5c-564f-41b6-8fbe-203cff7da0ee",
    "e53b35e0-74a3-419b-b44e-1b1445e41415",
    "d24d648d-d81c-4149-b769-ca788d57d645",
    "e741e3cd-4f39-4dfe-9d53-165c2dc7ff55",
    "89a7458d-0dde-4f0e-922f-fdfd5dbd3031",
    "1428168e-5264-4389-a078-e50d51c8719f",
    "0444adc1-cb04-4825-b2b8-7b53e61de59b",
    "fc83fe5a-d418-4d26-9a74-8ad22a13af03",
    "319bbd7f-6ad6-4ea0-a08d-014a131b7545",
    "726c0a8c-efa2-47fa-a79a-b812d2d586a9",
    "7f0dc3e2-2974-4250-a498-5834c71e4f3a",
    "84c4e92e-f44c-48e3-955b-41a2454257ce",
    "9a163b34-99d1-43d8-ba7c-89dfe0081996",
    "dc259aef-55f5-44e0-b192-2cfd7085a8d6",
    "9455a102-5d5f-4106-93e6-dcdeeeb1caa0",
    "be41fe48-b2ec-45c4-a654-7ad65ebb5da4",
    "ac125f03-5116-46b7-b1a9-34021a02b7f6",
    "18d8aad0-6de6-4ef2-98b1-76ac2965d99a",
    "76f7969b-526c-464b-96e9-b32452710626",
    "6cf4a193-156a-4220-a19b-6e030404e338",
    "f119d4af-e7b8-4383-8640-bdca8e86a280",
    "859aac6f-73d8-4073-9c96-ca63dfa0c98f",
    "2ad6621f-4df5-4feb-898f-947c3a57a846",
    "0f95c6b6-6480-4f6c-a8c9-cb1011ec7b6e",
    "6096d402-df80-43c5-94e3-212c11b0cb2e",
    "0495231c-e859-44ac-a78b-c7e575e32ee7",
    "b32a55a4-abd9-4e04-beec-8b6a9811b4af",
    "f828879a-11ce-4626-99c0-130c51fc4d47",
    "b827077e-7bcd-444f-9dbf-d3a46ff97d4d",
    "40f917cd-e148-48d4-ae3c-0e6060d3211d",
    "d21fca90-c11d-4580-b69d-0ef5f162c4a1",
    "70825e8d-70ba-441a-8aab-f535f99a9306",
    "103c4fc4-1c2b-4aaa-85f4-80c5d2669c38",
    "ff41a77c-b9f1-4fd6-90fb-4e4dd784a830",
    "81247a67-df16-4ff6-bc92-8f37efc34d24",
    "1576fd9d-819d-4027-98bd-2f4899f966a0",
    "03fd7639-3fde-4c76-b20e-02a55863bd11",
    "c3307dd9-0a4d-49b3-bdb4-121298a059ba",
    "6f2a1959-e6c9-46c1-a048-1f79f1d122c5",
    "05546c9b-9b29-4d89-a934-3f3bef2ef6c7",
    "eaad0764-e403-4fd5-a67d-1f670eb7afbc",
    "b1f22e36-bd99-4a85-ae7b-5e03f3e13972",
    "a7563f93-649e-43cd-a5e2-5377b0775865",
    "38900935-e00d-4b53-8a01-86cf20387fb1",
    "65338067-e721-43a7-8d1f-b58ab350dd3a",
    "071eb114-2b40-4658-8c3e-6c89d79ebcee",
    "25e9547f-1b9d-4159-bae0-2b9ef0cce14d",
    "14110c62-1922-4dc9-8229-33b03df970c3",
    "c26202ff-d5d7-4a5f-8796-b20a00ea84c9",
    "4802a6f2-6718-410d-bda6-8b03b1448f34",
    "6a7365dd-08a3-4515-a997-9d0c6759a01e",
    "64911a5a-8bbf-4000-8a0a-9d96d76be3a3",
    "704f8745-2c00-4f16-8069-09079d258de6",
    "013da8d7-0243-4cb3-af02-e3d213d0acb9",
    "f9860eaa-f073-46f4-bd30-d84ad5dd7715",
    "fe455d48-62ec-4e07-853d-b30dc99b1d28",
    "7dddf645-11b9-4047-9bc9-863dd38e0834",
    "9c2a9e66-826a-482b-bdfe-48b8f661507e",
    "623ed1b9-767f-466d-8941-ceb13037d296",
    "52067706-2990-4b71-b20e-6e7c18f9ff09",
    "1f4e7747-d513-48d7-925c-c8879f62159b",
    "90a4dcc9-c4ad-44c5-be63-49b8e22e255b",
    "94f58d59-fe3a-468e-847b-d3bf1d775076",
    "7ed1483a-a183-4a41-b271-4b7ecb4b7291",
    "0c04dba5-8405-443e-92bd-ab81a0446e8a",
    "13d7bb0d-7a7a-486f-a53c-7b06f5b41cf1",
    "6ba2d3e5-fa0f-4720-af46-a51c74edc7d5",
    "4eac71e7-f080-424d-bbe5-40ed20b355cf",
    "1832b966-afbe-457f-81db-92db329a25e6",
    "02fbcc38-a48d-4caa-ab98-2d97df822284",
    "13dc9ac5-7e06-4b21-b714-1d2a01e319d6",
    "82921cff-1c78-4798-b410-ed612fa155ea",
    "8d3df8a2-2045-4d3e-8b3b-11a440197896",
    "24e8834d-dc2c-4d89-b469-f27b4e25e8e1",
    "6cd1a31e-c5cb-4fd7-be17-2a078b77f434",
    "2a5f2213-cd26-4169-b39a-6f0079dc6219",
    "9b7db710-4da2-49c0-a342-c57a5bc51b3f",
    "0eeb5cdc-5951-4bea-9b53-bd71880c7aa0",
    "95629113-5bed-42a2-ad8d-8d3033386160",
    "b4f8f2f0-5dc7-498b-96a4-626c981ceb98",
    "c2a00eec-0bb6-4f71-96bd-6ee244343341",
    "97e1a58a-0e2b-4860-a023-d41a11d20df4",
    "5fecf148-e269-4f9c-b4bd-6cdb5569248b",
    "58e94ddc-d184-4851-8a64-51a664ee5331",
    "5813a2b5-7bf9-4b1b-8683-7010d308a520",
    "b0330aca-2b42-4ed1-8b82-846896ce5171",
    "75a9ebed-6237-4062-aaf0-a4efcfede835",
    "7811f46a-825a-42e4-b35f-bccb5e965daa",
    "2fe6fced-ddf5-4bc5-87be-2bf92ff55210",
    "ed4c85e7-df08-4368-a3f5-0788e48da1d5",
    "c2eafaa1-0efd-4914-b205-c24be9cbd8f1",
    "5cb81e41-96d3-48af-a4d3-2736f0b5e43a",
    "3078dd84-e83b-4a82-bcc8-6fcfe7736225",
    "370f798d-f72e-40b5-bd6f-d65fa694e793",
    "59fcdf74-98c0-4f88-8d8c-5289c73657c4",
    "4c6bc03f-eaf5-4554-a106-161227856d27",
    "e47a30e5-90ea-457f-bab0-1c66fadf32a5",
    "45ec23df-646b-48c3-9715-0cc63dc6300a",
    "b31bba6f-2c02-4d2b-92b2-3ea68f8bf20d",
    "480d2f6b-3c8d-496d-8f3d-29eea2efcde1",
    "4855a2c3-6cf7-4db6-9839-91d3bf4db70a",
    "d90dbb77-dba0-4050-90f7-f0471987a203",
    "e1437bdf-9491-464d-9881-86b03402e2df",
    "bea66ba6-53c4-4564-9279-f3884ab8b659",
    "0047136c-7695-4c43-94dc-806bff499800",
    "f9fb206d-30aa-4fb0-9a16-f98d9d3038c2",
    "baa71b62-6faf-4912-bd79-4a3c3dfcb4a1",
    "4c681e45-e3d0-46c3-ad60-72a3a6fddc9d",
    "9af25ec2-52a9-4a55-b56a-f59cefbea320",
    "5b4e7216-d59f-4123-abcd-fd0f5a4df934",
    "4310b802-7fe4-4f88-a7cb-6daa27c0f372",
    "d74d7e82-6ddc-406b-9a7b-66e226f2893a",
    "a936d283-105f-4a31-8eb1-771bd9d54d7f",
    "d7e11b0e-d7f7-4281-84ee-e7787c1efc31",
    "9b12e7c4-e110-4845-b647-7a2b2b989829",
    "d7b6ac82-530b-45ed-8f51-140fd9cf63f0",
    "e4065a2d-b7c5-422b-9b35-e39dcb4d69a1",
    "46743d87-e784-4c07-99a5-c710e1649e21",
    "40821f22-320d-4b08-8ca5-545f1ffa0972",
    "0416b179-8134-4725-b18c-3fa4496273ce",
    "b8ca6397-f01f-4a28-b1f1-01cd9e6d892a",
    "96bd1f60-5be7-43ab-96f8-e34f63d4f9be",
    "25cb3f17-d55d-4924-a55f-7f3708e03e70",
    "b4934e20-0252-4d4e-aa06-bbffc593b42b",
    "2ac1e0fd-8305-4983-a8e9-4d26a99e6e67",
    "8aeb9ec5-8e72-4081-a721-771b3ee7d019",
    "2dba7df9-8aa4-450e-bcca-aa52e819dfe1",
    "750fd057-7add-443f-b3ef-6411f01c2058",
    "4f533e9d-6097-4834-b455-2e9259989246",
    "947f2e87-1435-4b58-aa94-5a3c1918f646",
    "2538faa6-15c5-4aee-83de-6d57f89ed7c8",
    "6514ec87-a417-40dd-8696-1b19064c449b",
    "cc891529-5095-4fbb-8b0c-4ae2c9bb0876",
    "f70723ab-a9e2-48d9-a138-f8b376d9f416",
    "ed4fea30-aa64-4608-a729-2522ac3e101a",
    "67f9ac95-9181-4f1b-8e74-5f721edb9261",
    "ab7eedd3-0621-4bf4-b486-18883960e500",
    "19c52214-6677-48ec-a58d-90e5ae233274",
    "43f1ab09-206d-4f3c-80e8-b018efe70389",
    "1aa79fa8-afec-4700-a8bb-8e43940be63d",
    "f1b6a945-a7d6-4e44-8904-599dafb02b71",
    "1138566e-7aad-4134-a79b-6580a0ed2946",
    "765ca61c-71d8-425f-93d6-24a7ccfb0cfd",
    "fc657bee-f436-4685-a3b4-18228810d86d",
    "b9937c35-1904-45c9-af03-b0ade5056e10",
    "257430c1-1057-4033-be8a-8c2303034457",
    "7ae535a2-a505-4d20-8e0a-0ace9cabea8c",
    "6c532d46-f2bc-4556-a83e-997925db7030",
    "b93a9163-338b-469b-a296-86c647aae777",
    "eafdfea8-3dc0-4810-94cd-d6bc748a5a84",
    "98c31872-0c1e-4abd-842f-fe20fe0f838d",
    "dc872141-d1a6-4120-9feb-45c8597213c7",
    "689ee7ac-af0a-49ae-b172-9d81b42cfde3",
    "3febc842-9440-427f-ba72-267cd5d3f5fb",
    "5bcb3841-21af-4c38-8bd2-40f8cc762a1a",
    "5091c0ca-35f4-4fe7-adb3-c58082ab4965",
    "c2094126-e237-4ad8-946d-17a191e6854a",
    "8c21f543-9b22-4943-8442-f6c616fd45e5",
    "3c1477fa-0ee9-4f42-9d28-40529a54ccdf",
    "e5dfce25-e321-445b-b63b-149ef70f3167",
    "1b4d6496-8bd6-4433-80fb-748f2b1bcdec",
    "c5841a8a-9459-47ed-9210-89194f0c69e8",
    "67cfb445-1133-4eea-a8ae-f0e825c1b03b",
    "18738e6a-5cc9-4c21-a9c4-84ec73e3210d",
    "09ef7ba8-831e-496a-8db4-b8a4e6d59f0e",
    "40fb0007-4e34-4e0f-a594-312990f9370c",
    "5b285932-c831-4816-992d-dd06d324b703",
    "536508e7-d323-40da-8e97-d86167c0c78b",
    "8222755b-0567-4c46-a182-32ad2bd9cf3d",
    "6bd0db37-1630-4cec-a376-e37cfa508b05",
    "b0b05229-521c-46ac-a7f2-fb830d4f0f2e",
    "f1b74dff-37c0-4d18-9e17-3812eb8f6364",
    "f9d357e8-47f2-4e43-8dad-acc8248c2c41",
    "465ded07-1448-4b3d-826b-0faadb2588a3",
    "99d2446d-b00f-43f1-b688-586d1d98e3d9",
    "c514e2c3-09c0-4f21-bc79-d5768278fa19",
    "38cc831f-b229-4a4b-86f1-0456abc04078",
    "0b9c481f-5687-439e-8ff2-138f6a8f1b29",
    "31c6f751-16d4-49de-ad4a-4b3463b7645a",
    "5ac31d7c-83df-47fb-b6ff-6f705f71c011",
    "66b80259-c29a-410b-ac20-c77629f34b91",
    "4184e597-b5b0-435f-893e-031c6c4be7fd",
    "b0ff059d-215c-43dd-91c5-17d65bb1a80d",
    "9eac7a77-52a9-4951-a64b-fa89d24cd5bd",
    "0b4fc9a2-0ec5-4ee1-9a46-b785d8106f03",
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
    "1b8bc615-89fa-4e2d-b587-fb918e287957",
    "e3ba9a3b-6df3-453f-9b70-e863625b4854",
    "832f0871-6ebc-473b-8d25-4d7bd81f3dce",
    "5558665b-233a-479a-8bf8-ee872ae53514",
    "64f59208-e85b-4aac-b7c7-2ab4df5dfe61",
    "0764263a-4866-48de-b7b8-f53d9b2254c1",
    "a7a29f01-d21d-4441-884f-b0d90c12bd42",
    "0ba925a5-61a0-4968-b81e-5bf929000f35",
    "2ed7eb75-5f83-4a4d-9726-f117d99359da",
    "259f6b94-bc42-4a87-832a-014b4699f159",
    "d124fb2d-6992-4517-bdf6-133bdcb9fa77",
    "e947d893-589f-4cd1-9f47-8e5dd0ff56b9",
    "2edfceeb-7136-4a5d-be99-38b2637bf5d4",
    "81b3f9c4-6d88-4bf5-93b2-5c23fb4da78b",
    "db46bdf1-27c0-4457-8de1-8750d4850c88",
    "24f875f0-8cbe-430c-b93c-0f769c66b321",
    "bc8d325f-1d56-41ce-92ef-503c5d003ee4",
    "6a0cf1c1-9290-4552-bbdd-72854237c59f",
    "9aac8814-c3a7-495e-8a1f-62e0f8b129a3",
    "956717c8-37f4-4a0f-a266-ab28800cfb6d",
    "8ca8d9a0-cb85-45b0-8070-084ddf63cba9",
    "0fa5d5dd-72f7-4aab-98a5-190226751364",
    "63ed559c-7cbb-4ffd-a52c-b9de0041de06",
    "4ca4f49c-d606-4999-bad5-a3f422bb743d",
    "c5cc9b0e-875f-408d-a82d-28f7af5ad4ab",
    "980b5623-90b5-4fcb-abba-e41858b71399",
    "e02a4404-dedd-49b8-873d-d572c2c6fc12",
    "9f039458-381a-49ab-860c-5726c6774747",
    "5a5f7997-f540-4d17-9875-b92f35be9ebc",
    "51e834e3-31f2-4daa-9c1e-e513dad67e57",
    "1ffe30ff-fbd0-40ee-a747-30dd3f83e059",
    "a082ce61-f8b6-4ad9-af31-c71afe9e254f",
    "6526c434-49eb-4ac9-8aa4-5561bcdddd09",
    "40f0ded1-e3b0-4dfa-9887-bf7162416f2b",
    "b8521d54-9301-46a3-81c5-b0c60d741c03",
    "78a8eaa9-2ba7-48c9-a5c9-8d8f46ebed15",
    "66aa9a47-6e47-4e20-808e-9f69ab745475",
    "2b7eea96-a27e-482a-b1e7-d682303410fb",
    "5c21e92e-bf9d-4c01-b979-7192ae35eeb3",
    "535a2b22-dff1-4514-8641-676119e4bbf8",
    "e9f83f6f-4936-4db4-92f8-c8508597cc4c",
    "2c677e20-2da2-4add-a50f-0f8fb9c8bb8d",
    "ffb7407b-94dc-4e5f-98da-2062f4586480",
    "d53e1e1a-43b0-415f-a296-8b798dc3f7a6",
    "6147ce3b-1fd9-420a-bdda-3f19e691c5c4",
    "2a0d38e9-5e49-4a84-9ded-50cc03179f3c",
    "70a64a31-8031-4904-ad66-fd1497921fb8",
    "c6c94678-9c9b-4df1-83d7-0a945c9fefa3",
    "2eb3d0ca-ca95-4d0c-816a-d735a4bdf7df",
    "7ab037fd-4ffc-4625-84ca-ee3d85f6e2c0",
    "fd1dc392-09cb-4d1d-a1bb-9075fec54d31",
    "35c01118-09db-4f66-a4c2-6ce5edbbf2d6",
    "0a4c10d7-3231-4519-9acc-1a5b5ef16b87",
    "606a611c-bd03-48d1-a759-73eb9a3a1ec3",
    "59cb197b-1341-43a2-8c15-0b36e937032f",
    "c739cee5-0aed-44ae-ab15-d81621d85e62",
    "952d14e3-fb90-4fd1-818e-2052f6b9bb73",
    "ece14259-1be9-4324-abef-beff98c383af",
    "4b2bd941-d39b-4656-921a-e2f46d165f96",
    "67b04e10-23cc-4dd9-8913-211062294bee",
    "8544d629-210e-417d-9829-bdea35c23c63",
    "c0636c43-051c-44ef-9468-cb2bd97c7edd",
    "91a73a66-931d-4463-a196-51c93714228d",
    "cbc8cabf-48fd-4543-a548-6047f48c5740",
    "25be1050-69d9-4e70-9f09-84498ceffba7",
    "ff937ebf-5c50-4074-8a53-51a7733c04e2",
    "3c7a7fc6-eda6-4aa8-b314-ca915da33de6",
    "517e7356-b774-4f4f-be26-48bb6aaf5389",
    "2268f178-49bd-43af-ac48-14d81209a041",
    "739636dc-e27a-44b0-83b8-699c8e70679c",
    "094aecb7-b26e-4da6-a62a-9323a6dbf78f",
    "81d68294-24a2-48d4-8ef2-e190c71ea612",
    "9b7e011f-aa39-415b-b52e-18d88d7f6e01",
    "48008727-a741-41cc-b552-9114c15c7b8e",
    "96b9a7ba-dee5-40ab-973d-b8bffa39d7db",
    "bdd4ddde-3fca-42f6-8a3d-d2b541b76b3d",
    "1e0a7296-b3d8-4c6c-a0f7-ce8b3f3196a1",
    "e8dc442d-7975-4274-bb4a-8daf077f67b8",
    "239e6ced-3cee-41d2-b870-127e94ea5cb3",
    "b44ecd94-8234-4b5c-898a-b5419b5e6409",
    "3d60b449-76f2-438f-93e9-e9e56cd642c4",
    "5118b88b-2206-485f-9ec8-e35a7c66ba82",
    "bddfab74-ac9c-4db4-b519-414b77b934ff",
    "de81b7a9-8637-4449-973f-e25feaf96e71",
    "48053c13-669b-4e5f-a088-64c22d79b1d6",
    "6ebc48dd-90c9-4bf7-8ee9-329cb9054044",
    "3fe40b49-14db-445b-9e22-19aea3fd44b9",
    "3a31abab-2778-40bd-a939-72f3c685f769",
    "a3ebb7a0-d312-4e24-9fe8-3ce04bf3ee1a",
    "be8bed31-27ac-4e75-9562-3042381e1565",
    "321e540a-9cee-4c72-9071-93359303321e",
    "d01139c5-4363-4a22-a4b0-d5eb895a6d8a",
    "24bdabd7-03f5-410f-866c-d5759bf89520",
    "b19e1087-d81b-44ae-805f-eaa9181cbd1e",
    "9f0b5d28-a4b2-4c7a-905d-68af6798b39c",
    "a66acc36-0014-4aca-8886-1d76c5506745",
    "da435af9-f0f0-4e58-b17b-21b3ee58f2a1",
    "368fb0c5-13f7-445b-a3e9-72f1f9b8279f",
    "d0fa30bc-af7c-4b40-b995-90727abaed8e",
    "fcba7552-dcdb-489d-8a7b-ca8259719d88",
    "b22ed959-a48e-4bcb-ac34-a5f2cf11d12c",
    "0289020f-f016-4c19-9e1e-6876db1ac45b",
    "14193a41-9840-473e-81f7-f57e2e8388fd",
    "3973aa54-001d-470f-ae9f-8d7c02cd6b07",
    "b733832f-ffa2-49a3-a045-957275d6754b",
    "70c1b19d-ff31-4b6b-81a5-4d5dbaad4a3f",
    "78f2e537-47c8-4abb-b45c-0d875c8a391b",
    "b8db33c5-bed3-4092-9f98-1f9154c6dcd5",
    "5ba5fec7-dba6-4062-b5ef-bed5a3e3dcac",
    "bfcd7e3d-a6fc-492e-a494-8550c17714a0",
    "a678da7f-b99d-47b2-a106-ef6cab1b9433",
    "1eb97b3b-652f-45e8-9fc3-4ab59645688c",
    "6ca999c1-ca75-4a60-b384-4e3279a3d2e2",
    "3758b43b-2095-4370-9f2a-e4551f9f9d06",
    "3e79cf54-5ddd-4e5a-8b16-cab65263d6f6",
    "a967eba5-c023-4843-a7b2-9b7d96807c69",
    "eb702123-8c7a-40f3-b70f-6b50e941d2c4",
    "7f95f5f9-73a8-4b39-add8-2d3c076a719c",
    "4afbb45e-8267-44b7-badf-c6a1a3ce988e",
    "a4b5ef0a-1dd1-423f-bd85-538fc77d7cff"
]

interface PageProps {
    params: { imageCode: string };
}

export default function Home({ params }: PageProps) {
    const { imageCode } = params;
    const [stack, setStack] = useState(keys);
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