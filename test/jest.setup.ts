import { enableMapSet, enablePatches, setAutoFreeze } from 'immer';

setAutoFreeze(false);

// Enable patches for immer
enablePatches();

// Enable Map and Set support in immer
enableMapSet();
