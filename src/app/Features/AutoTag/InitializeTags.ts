import { getBlocks } from "~/Utils";
import { BaseFeature } from "@features/BaseFeature";

import { updateTags } from "./utilsTags";

export class InitializeTags extends BaseFeature {
    public static shouldRunOnce = true;

    public handle(): boolean {
        const blocks = getBlocks();

        blocks.forEach((block) => {
            updateTags(block.id);
        })

        return true;
    }
}