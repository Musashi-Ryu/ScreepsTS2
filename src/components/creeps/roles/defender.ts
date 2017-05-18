import * as StructureManager from "./../../structures/structureManager";
import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep The current creep.
 */
export function run(creep: Creep) {
    let structures: Structure[] = StructureManager.loadStructures(creep.room);

    if (creep.room.memory.gateClosed) {
        let emptyRamparts = _getEmptyRamparts(structures, creep.room);

        if (emptyRamparts) {
            creepActions.moveTo(creep, emptyRamparts[0]);
        }
    } else {
        creepActions.moveTo(creep, StructureManager.getSpawn(creep.room));
    }
}

/**
 * Get an array of empty ramparts.
 *
 * 
 * Returns `null` if there are no (empty) ramparts.
 *
 * @export
 * @param {Structure[]} structures The list of structures.
 * @returns {(Structure[] | null)} an array of structures to repair.
 */
function _getEmptyRamparts(structures: Structure[], room: Room): Rampart[] | null {

    let targets: Structure[];
    let ramparts: Rampart[] = [];

    // Filter for ramparts.
    targets = structures.filter((structure: Structure) => {
        return (structure.structureType === STRUCTURE_RAMPART);
    });

    // If nothing is found, return null.
    // Else check if the rampart is occupied by a defender.
    if (targets.length === 0) {
        return null;
    } else {
        targets.forEach((rampart: Rampart) => {
            let lookResults = room.lookForAt(LOOK_CREEPS, rampart.pos);

            if (lookResults.length !== 0) {
                for (let result of <Creep[]> lookResults) {
                    if (result.memory.role !== "defender") {
                        ramparts.push(rampart);
                    }
                }
            } else {
                ramparts.push(rampart);
            }
        });
    }

    return ramparts;
}

/**
 * Get an array of structures that needs repair.
 *
 * This does *not* initially include defensive structures (walls, roads,
 * ramparts). If there are no such structures to be repaired, this expands to
 * include roads, then ramparts.
 *
 * Returns `undefined` if there are no structures to be repaired. This function
 * will never return a wall.
 *
 * @export
 * @param {Structure[]} structures The list of structures.
 * @returns {(Structure[] | undefined)} an array of structures to repair.
 */
