import * as creepActions from "../creepActions";
import * as structureManager from "../../structures/structureManager";
/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep The current creep.
 */
export function run(creep: Creep): void {
    if (typeof creep.memory.delivering === "undefined") {
        creep.memory.delivering = false;
    }
    if (typeof creep.memory.deliveryTarget === "undefined") {
        creep.memory.deliveryTarget = null;
    }
    if (typeof creep.memory.roomNameRemote === "undefined") {
        creep.memory.roomNameRemote = null;
    }

    if (_.sum(creep.carry) === 0) {
        creep.memory.delivering = false;
        creep.memory.deliveryTarget = null;
    }

    if (_.sum(creep.carry) < creep.carryCapacity && !creep.memory.delivering) {
        if (creep.memory.roomNameRemote !== null) {
            let room: Room = Game.rooms[creep.memory.roomNameRemote];
            let targetSource: Resource[] = room.find<Resource>(FIND_DROPPED_RESOURCES, {
                filter: (resource: Resource) => {
                    return resource.amount > 250;
                },
            });

            if (targetSource[0]) {
                if (creep.pos.isNearTo(targetSource[0])) {
                    creep.pickup(targetSource[0]);
                } else {
                    creepActions.moveToResource(creep, targetSource[0]);
                }
            }
        }
    } else {
        creep.memory.delivering = true;
        if (creep.memory.deliveryTarget !== null) {
            let structure = Game.getObjectById<Structure>(creep.memory.deliveryTarget);
            if (structure !== null) {
                let target;
                let notFull: boolean | null = null;
                switch (structure.structureType) {
                    case STRUCTURE_TOWER:
                    case STRUCTURE_SPAWN:
                    case STRUCTURE_EXTENSION: {
                        target = <Tower> structure;
                        notFull = target.energy < target.energyCapacity;
                        break;
                    }
                    case STRUCTURE_CONTAINER:
                    case STRUCTURE_STORAGE: {
                        target = <Container> structure;
                        notFull = _.sum(target.store) < target.storeCapacity;
                        break;
                    }
                    default: {
                        break;
                    }
                }
                if (notFull !== null && notFull) {
                    if (creep.pos.isNearTo(structure)) {
                        creep.transfer(structure, RESOURCE_ENERGY);
                    } else {
                        creepActions.moveTo(creep, structure);
                    }
                } else {
                    creep.memory.deliveryTarget = null;
                }
            } else {
                creep.memory.deliveryTarget = null;
            }
        } else {
            let structure: Structure = structureManager
                .getDropOffPoint(Game.rooms[creep.memory.room].find<Structure>(FIND_STRUCTURES));
            if (creep.pos.isNearTo(structure)) {
                creep.transfer(structure, RESOURCE_ENERGY);
            } else {
                creepActions.moveTo(creep, structure);
                creep.memory.deliveryTarget = structure.id;
            }
        }
    }
}
