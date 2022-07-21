import { BaseFeature } from "@features/BaseFeature";

export class InitializeTags extends BaseFeature {
    public static shouldRunOnce = true;

    public handle(): boolean {
        return true;
    }
}