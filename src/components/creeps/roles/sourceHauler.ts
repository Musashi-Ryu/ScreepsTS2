import * as creepActions from "../creepActions";

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
                        target = <Extension>structure;
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
                        target = <Container>structure;
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
            }
            else {
                creep.memory.deliveryTarget = null;
            }
        }
        else {
            let targetTowers = creep.room.find<Tower>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    if (structure.structureType === STRUCTURE_TOWER) {
                        let tower: Tower = <Tower> structure;
                        if (tower.energy < tower.energyCapacity) {
                            return tower;
                        }
                    }
                },
            });

            if (targetTowers.length > 0) {
                targetTowers.forEach((tower: Tower) => {
                    if (creep.pos.isNearTo(tower)) {
                        creep.transfer(tower, RESOURCE_ENERGY);
                    } else {
                        creepActions.moveTo(creep, tower);
                        creep.memory.deliveryTarget = tower.id;
                    }
                });
            } else {
                let targetSpawn = creep.pos.findClosestByRange<Spawn>(FIND_MY_SPAWNS);
                if (targetSpawn.energy < targetSpawn.energyCapacity) {
                    if (creep.pos.isNearTo(targetSpawn)) {
                        creep.transfer(targetSpawn, RESOURCE_ENERGY);
                    } else {
                        creepActions.moveTo(creep, targetSpawn);
                        creep.memory.deliveryTarget = targetSpawn.id;
                    }
                } else {
                    let targetExtensions = creep.room.find<Extension>(FIND_STRUCTURES, {
                        filter: (structure: Structure) => {
                            if (structure.structureType === STRUCTURE_EXTENSION) {
                                let extension = <Extension> structure;
                                if (extension.energy < extension.energyCapacity) {
                                    return extension;
                                }
                            }
                        },
                    });

                    if (targetExtensions.length > 0) {
                        targetExtensions.forEach((extension: Extension) => {
                            if (creep.pos.isNearTo(extension)) {
                                creep.transfer(extension, RESOURCE_ENERGY);
                            } else {
                                creepActions.moveTo(creep, extension);
                                creep.memory.deliveryTarget = extension.id;
                            }
                        });
                    } else {
                        let targetContainers = creep.room.find<Container>(FIND_STRUCTURES, {
                            filter: (structure: Structure) => {
                                if (structure.structureType === STRUCTURE_CONTAINER) {
                                    let container = <Container> structure;
                                    if (_.sum(container.store) < container.storeCapacity) {
                                        return container;
                                    }
                                }
                            },
                        });

                        let targetStorages = creep.room.find<Storage>(FIND_STRUCTURES, {
                            filter: (structure: Structure) => {
                                if (structure.structureType === STRUCTURE_STORAGE) {
                                    let storage = <Storage> structure;
                                    if (_.sum(storage.store) < storage.storeCapacity) {
                                        return storage;
                                    }
                                }
                            },
                        });

                        if (targetContainers.length > 0) {
                            targetContainers.forEach((container: Container) => {
                                if (creep.pos.isNearTo(container)) {
                                    creep.transfer(container, RESOURCE_ENERGY);
                                } else {
                                    creepActions.moveTo(creep, container);
                                    creep.memory.deliveryTarget = container.id;
                                }
                            });
                        } else if (targetStorages.length > 0) {
                            targetStorages.forEach((storage: Storage) => {
                                if (creep.pos.isNearTo(storage)) {
                                    creep.transfer(storage, RESOURCE_ENERGY);
                                } else {
                                    creepActions.moveTo(creep, storage);
                                    creep.memory.deliveryTarget = storage.id;
                                }
                            });
                        }
                    }
                }
            }
        }
    }
}
