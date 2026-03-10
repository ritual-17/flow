import { enableMapSet, enablePatches, setAutoFreeze } from 'immer';

setAutoFreeze(false);

// Enable Map and Set support in immer
enablePatches();
enableMapSet();
