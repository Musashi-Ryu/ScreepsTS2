﻿import * as Config from "../../config/config";

import * as sourceMiner from "./roles/sourceMiner";
import * as sourceMinerRemote from "./roles/sourceMinerRemote";
import * as sourceHauler from "./roles/sourceHauler";
import * as sourceHaulerRemote from "./roles/sourceHaulerRemote";
import * as upgrader from "./roles/upgrader";
import * as builder from "./roles/builder";
import * as repairer from "./roles/repairer";
import * as wallRepairer from "./roles/wallRepairer";
import * as rampartRepairer from "./roles/rampartRepairer";
import * as defender from "./roles/defender";
import * as linker from "./roles/linker";

import { log } from "../../utils/log";

export let creeps: Creep[];
export let creepNames: string[] = [];
export let creepCount: number = 0;

export let sourceMiners: Creep[] = [];
export let sourceMinersRemote: Creep[] = [];
export let sourceHaulers: Creep[] = [];
export let sourceHaulersRemote: Creep[] = [];
export let upgraders: Creep[] = [];
export let builders: Creep[] = [];
export let repairers: Creep[] = [];
export let wallRepairers: Creep[] = [];
export let rampartRepairers: Creep[] = [];
export let defenders: Creep[] = [];
export let linkers: Creep[] = [];

/**
 * Initialization scripts for CreepManager module.
 *
 * @export
 * @param {Room} room
 */
export function run(room: Room): void {
    _loadCreeps(room);
    _buildMissingCreeps(room);

    _.each(creeps, (creep: Creep) => {
        if (creep.memory.role === "sourceMiner") {
            sourceMiner.run(creep);
        }
        if (creep.memory.role === "sourceMinerRemote") {
            sourceMinerRemote.run(creep);
        }
        if (creep.memory.role === "sourceHauler") {
            sourceHauler.run(creep);
        }
        if (creep.memory.role === "sourceHaulerRemote") {
            sourceHaulerRemote.run(creep);
        }
        if (creep.memory.role === "upgrader") {
            upgrader.run(creep);
        }
        if (creep.memory.role === "builder") {
            builder.run(creep);
        }
        if (creep.memory.role === "repairer") {
            repairer.run(creep);
        }
        if (creep.memory.role === "wallRepairer") {
            wallRepairer.run(creep);
        }
        if (creep.memory.role === "rampartRepairer") {
            rampartRepairer.run(creep);
        }
        if (creep.memory.role === "defender") {
            defender.run(creep);
        }
        if (creep.memory.role === "linker") {
            linker.run(creep);
        }
    });
}

/**
 * Loads and counts all available creeps.
 *
 * @param {Room} room
 */
function _loadCreeps(room: Room) {
    //hack
    let otherRoom: Room = Game.rooms["W37N96"];
    if (otherRoom !== undefined) {
        let otherCreeps: Creep[] = otherRoom.find<Creep>(FIND_MY_CREEPS);
        creeps = room.find<Creep>(FIND_MY_CREEPS).concat(otherCreeps);
    } else {
        creeps = room.find<Creep>(FIND_MY_CREEPS);
    }
    creepCount = _.size(creeps);

    // Iterate through each creep and push them into the role array.
    sourceMiners = _.filter(creeps, (creep) => creep.memory.role === "sourceMiner");
    sourceMinersRemote = _.filter(creeps, (creep) => creep.memory.role === "sourceMinerRemote");
    sourceHaulers = _.filter(creeps, (creep) => creep.memory.role === "sourceHauler");
    sourceHaulersRemote = _.filter(creeps, (creep) => creep.memory.role === "sourceHaulerRemote");
    upgraders = _.filter(creeps, (creep) => creep.memory.role === "upgrader");
    builders = _.filter(creeps, (creep) => creep.memory.role === "builder");
    repairers = _.filter(creeps, (creep) => creep.memory.role === "repairer");
    wallRepairers = _.filter(creeps, (creep) => creep.memory.role === "wallRepairer");
    rampartRepairers = _.filter(creeps, (creep) => creep.memory.role === "rampartRepairer");
    defenders = _.filter(creeps, (creep) => creep.memory.role === "defender");
    linkers = _.filter(creeps, (creep) => creep.memory.role === "linker");

    if (Config.ENABLE_DEBUG_MODE) {
        log.debug(creepCount + " creeps found in the playground.");
    }
}

/**
 * Creates a new creep if we still have enough space.
 *
 * @param {Room} room
 */
function _buildMissingCreeps(room: Room) {
    let bodyParts: string[] = [];

    let spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
        filter: (spawn: Spawn) => {
            return spawn.spawning === null;
        },
    });

    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
        bodyParts = [WORK, CARRY, CARRY, MOVE, MOVE];
    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
        bodyParts = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    }

    for (let spawn of spawns) {
        if (Config.ENABLE_DEBUG_MODE) {
            log.debug("Spawning from:", spawn.name);
        }

        if (spawn.canCreateCreep) {
            if (sourceMiners.length >= 1) {
                if (sourceHaulers.length < Memory.rooms[room.name].jobs.haulerJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                    } else if (sourceHaulers.length < 1) {
                        bodyParts = [CARRY, CARRY, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "sourceHauler");
                    break;
                } else if (sourceHaulersRemote.length < Memory.rooms[room.name].jobs.haulerRemoteJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
                    } else if (sourceHaulersRemote.length < 1) {
                        bodyParts = [CARRY, CARRY, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "sourceHaulerRemote");
                    break;
                } else if (sourceMiners.length < Memory.rooms[room.name].jobs.sourceMiningJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "sourceMiner");
                } else if (sourceMinersRemote.length < Memory.rooms[room.name].jobs.sourceMiningRemoteJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "sourceMinerRemote");
                } else if (upgraders.length < Memory.rooms[room.name].jobs.upgraderJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    }
                    // In case we ran out of creeps.
                    if (upgraders.length < 1) {
                        bodyParts = [WORK, WORK, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "upgrader");
                } else if (builders.length < Memory.rooms[room.name].jobs.builderJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    }
                    // In case we ran out of creeps.
                    if (builders.length < 1) {
                        bodyParts = [WORK, WORK, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "builder");
                } else if (repairers.length < Memory.rooms[room.name].jobs.repairJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    }
                    // In case we ran out of creeps.
                    if (repairers.length < 1) {
                        bodyParts = [WORK, WORK, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "repairer");
                } else if (wallRepairers.length < Memory.rooms[room.name].jobs.wallRepairJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    }
                    // In case we ran out of creeps.
                    if (wallRepairers.length < 1) {
                        bodyParts = [WORK, WORK, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "wallRepairer");
                } else if (rampartRepairers.length < Memory.rooms[room.name].jobs.rampartRepairJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
                    }
                    // In case we ran out of creeps.
                    if (rampartRepairers.length < 1) {
                        bodyParts = [WORK, WORK, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "rampartRepairer");
                } else if (defenders.length < Memory.rooms[room.name].jobs.defenderJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE,
                            ATTACK, ATTACK, ATTACK, ATTACK];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                            TOUGH, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
                    }
                    // In case we ran out of creeps.
                    if (defenders.length < 1) {
                        bodyParts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                            MOVE, ATTACK, ATTACK];
                    }
                    _spawnCreep(spawn, bodyParts, "defender");
                } else if (linkers.length < Memory.rooms[room.name].jobs.linkerJobs) {
                    if (room.energyCapacityAvailable < 550 && room.energyAvailable < 550) {
                        bodyParts = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE];
                    } else if (room.energyCapacityAvailable >= 550 && room.energyAvailable >= 550) {
                        bodyParts = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE];
                    }
                    // In case we ran out of creeps.
                    if (linkers.length < 1) {
                        bodyParts = [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE];
                    }
                    _spawnCreep(spawn, bodyParts, "linker");
                }
            } else {
                if (sourceMiners.length < Memory.rooms[room.name].jobs.sourceMiningJobs) {
                    bodyParts = [WORK, WORK, MOVE, MOVE];
                    _spawnCreep(spawn, bodyParts, "sourceMiner");
                    break;
                }
            }
        }
    }
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {string} role
 * @returns
 */
function _spawnCreep(spawn: Spawn, bodyParts: string[], role: string) {
    let uuid: number = Memory.uuid;
    let status: number | string = spawn.canCreateCreep(bodyParts);

    let properties: { [key: string]: any } = {
        role,
        room: spawn.room.name,
    };

    status = _.isString(status) ? OK : status;
    if (status === OK) {
        Memory.uuid = uuid + 1;
        let creepName: string = spawn.room.name + " - " + role + uuid;

        log.info("Started creating new creep: " + creepName);
        if (Config.ENABLE_DEBUG_MODE) {
            log.debug("Body: " + bodyParts);
            log.debug("UUID: " + uuid);
        }

        status = spawn.createCreep(bodyParts, creepName, properties);

        return _.isString(status) ? OK : status;
    } else {
        if (Config.ENABLE_DEBUG_MODE) {
            log.error("Failed creating new creep: " + status);
        }

        return status;
    }
}
