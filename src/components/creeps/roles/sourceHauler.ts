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

    if (_.sum(creep.carry) === 0) {
        creep.memory.delivering = false;
        creep.memory.deliveryTarget = null;
    }

    if (_.sum(creep.carry) < creep.carryCapacity && !creep.memory.delivering) {
        let targetSource: Resource = creep.pos.findClosestByPath<Resource>(FIND_DROPPED_RESOURCES);

        if (targetSource) {
            if (creep.pos.isNearTo(targetSource)) {
                creep.pickup(targetSource);
            } else {
                creepActions.moveToResource(creep, targetSource);
            }
        }
    } else {
        creep.memory.delivering = true;
        if (creep.memory.deliveryTarget !== null) {
            let structure = Game.getObjectById<Structure>(creep.memory.deliveryTarget);
            if (structure !== null) {
                let target;
                switch (structure.structureType) {
                    case STRUCTURE_TOWER: {
                        target = <Tower> structure;
                        if (target.energy < target.energyCapacity) {
                            if (creep.pos.isNearTo(target)) {
                                creep.transfer(target, RESOURCE_ENERGY);
                            } else {
                                creepActions.moveTo(creep, target);
                            }
                        } else {
                            creep.memory.deliveryTarget = null;
                        }
                        break;
                    }
                    case STRUCTURE_SPAWN: {
                        target = <Spawn> structure;
                        if (target.energy < target.energyCapacity) {
                            if (creep.pos.isNearTo(target)) {
                                creep.transfer(target, RESOURCE_ENERGY);
                            } else {
                                creepActions.moveTo(creep, target);
                            }
                        } else {
                            creep.memory.deliveryTarget = null;
                        }
                        break;
                    }
                    case STRUCTURE_EXTENSION: {
                        target = <Extension> structure;
                        if (target.energy < target.energyCapacity) {
                            if (creep.pos.isNearTo(target)) {
                                creep.transfer(target, RESOURCE_ENERGY);
                            } else {
                                creepActions.moveTo(creep, target);
                            }
                        } else {
                            creep.memory.deliveryTarget = null;
                        }
                        break;
                    }
                    case STRUCTURE_CONTAINER: {
                        target = <Container> structure;
                        if (_.sum(target.store) < target.storeCapacity) {
                            if (creep.pos.isNearTo(target)) {
                                creep.transfer(target, RESOURCE_ENERGY);
                            } else {
                                creepActions.moveTo(creep, target);
                            }
                        } else {
                            creep.memory.deliveryTarget = null;
                        }
                        break;
                    }
                    case STRUCTURE_STORAGE: {
                        target = <Storage> structure;
                        if (_.sum(target.store) < target.storeCapacity) {
                            if (creep.pos.isNearTo(target)) {
                                creep.transfer(target, RESOURCE_ENERGY);
                            } else {
                                creepActions.moveTo(creep, target);
                            }
                        } else {
                            creep.memory.deliveryTarget = null;
                        }
                        break;
                    }
                    default: {
                        break;
                    }
                }
            } else {
                creep.memory.deliveryTarget = null;
            }
        } else {
            let structure: Structure = structureManager.getDropOffPoint(creep.room.find<Structure>(FIND_MY_STRUCTURES));
            if (creep.pos.isNearTo(structure)) {
                creep.transfer(structure, RESOURCE_ENERGY);
            } else {
                creepActions.moveTo(creep, structure);
                creep.memory.deliveryTarget = structure.id;
            }
        }
    }
}
