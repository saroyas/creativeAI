"use client";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LightningBoltIcon, MagicWandIcon } from "@radix-ui/react-icons";
import {
  AtomIcon,
  BrainIcon,
  Rabbit,
  RabbitIcon,
  SparklesIcon,
  WandSparklesIcon,
  Flame
} from "lucide-react";
import { useConfigStore, useMessageStore } from "@/stores";
import { ChatModel } from "../../generated";
import { isCloudModel, isLocalModel } from "@/lib/utils";
import _ from "lodash";

type Model = {
  name: string;
  description: string;
  value: string;
  smallIcon: React.ReactNode;
  icon: React.ReactNode;
};

const modelMap: Record<ChatModel, Model> = {
  [ChatModel.LLAMA_3_405B]: {
    name: "Powerful (censored)",
    description: "SiliconSoulAI/Llama-405B",
    value: ChatModel.LLAMA_3_405B,
    smallIcon: <Flame className="w-4 h-4 text-red-500" />,
    icon: <Flame className="w-5 h-5 text-red-500" />,
  },
  [ChatModel.LLAMA_3_70B]: {
    name: "Advisor",
    description: "SiliconSoulAI/Devil-70B",
    value: ChatModel.LLAMA_3_70B,
    smallIcon: <LightningBoltIcon className="w-4 h-4 text-yellow-500" />,
    icon: <LightningBoltIcon className="w-5 h-5 text-yellow-500" />,
  },
  [ChatModel.GPT_3_5_TURBO]: {
    name: "Creative Writer",
    description: "SiliconSoulAI/Creative-70B",
    value: ChatModel.GPT_3_5_TURBO,
    smallIcon: <RabbitIcon className="w-4 h-4 text-cyan-500" />,
    icon: <RabbitIcon className="w-5 h-5 text-cyan-500" />,
  },
  [ChatModel.GPT_4O]: {
    name: "Psychologist",
    description: "SiliconSoulAI/EmotionalQ-70B",
    value: ChatModel.GPT_4O,
    smallIcon: <BrainIcon className="w-4 h-4 text-pink-500" />,
    icon: <BrainIcon className="w-5 h-5 text-pink-500" />,
  },
  [ChatModel.GEMMA]: {
    name: "Gemma",
    description: "ollama/gemma",
    value: ChatModel.GEMMA,
    smallIcon: <SparklesIcon className="w-4 h-4 text-[#449DFF]" />,
    icon: <SparklesIcon className="w-5 h-5 text-[#449DFF]" />,
  },
  [ChatModel.MISTRAL]: {
    name: "Mistral",
    description: "ollama/mistral",
    value: ChatModel.MISTRAL,
    smallIcon: <AtomIcon className="w-4 h-4 text-[#FF7000]" />,
    icon: <AtomIcon className="w-5 h-5 text-[#FF7000]" />,
  },
  [ChatModel.LLAMA3]: {
    name: "",
    description: "",
    value: "",
    smallIcon: undefined,
    icon: undefined
  }
};

const localModelMap: Partial<Record<ChatModel, Model>> = _.pickBy(
  modelMap,
  (_, key) => isLocalModel(key as ChatModel)
);

const cloudModelMap: Partial<Record<ChatModel, Model>> = _.pickBy(
  modelMap,
  (_, key) => isCloudModel(key as ChatModel)
);

const ModelItem: React.FC<{ model: Model }> = ({ model }) => (
  <SelectItem
    key={model.value}
    value={model.value}
    className="flex flex-col items-start p-2"
  >
    <div className="flex items-center space-x-2">
      {model.icon}
      <div className="flex flex-col">
        <span className="font-bold">{model.name}</span>
        {/* <span className="text-muted-foreground">{model.description}</span> */}
      </div>
    </div>
  </SelectItem>
);

export function ModelSelection() {
  const { model, setModel } = useMessageStore();
  const { localMode } = useConfigStore();

  return (
    <Select
      value={model}
      onValueChange={(value) => {
        if (value) {
          setModel(value as ChatModel);
        }
      }}
    >
      <SelectTrigger className="w-fit space-x-2 bg-transparent outline-none border border-gray-700 select-none focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-sm">
        <SelectValue>
          <div className="flex items-center space-x-2">
            {modelMap[model].smallIcon}
            <span className="font-semibold">{modelMap[model].name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className="w-[250px] z-50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <SelectGroup>
          {Object.values(localMode ? localModelMap : cloudModelMap).map(
            (model) => (
              <ModelItem key={model.value} model={model} />
            )
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
