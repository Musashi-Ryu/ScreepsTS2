﻿import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep The current creep.
 */
export function run(creep: Creep) {
    let roomController: StructureController | undefined = creep.room.controller;

    if (typeof creep.memory.upgrading === "undefined") {
        creep.memory.upgrading = false;
    }

    if (_.sum(creep.carry) === 0) {
        creep.memory.upgrading = false;
    }

    if (_.sum(creep.carry) < creep.carryCapacity && !creep.memory.upgrading) {
        creepActions.tryRetrieveEnergy(creep);
    } else {
        creep.memory.upgrading = true;

        if (roomController && creep.upgradeController(roomController) === ERR_NOT_IN_RANGE) {
            creepActions.moveTo(creep, roomController);
        }
    }
}
