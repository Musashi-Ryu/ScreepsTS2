import * as creepActions from "../creepActions";
import * as structureManager from "../../structures/structureManager";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep The current creep.
 */
export function run(creep: Creep): void {
    let availablePositions = Memory.rooms[creep.room.name]
        .unoccupied_link_positions;
    let assignedPosition: RoomPosition;

    if (availablePositions.length > 0 && !creep.memory.occupied_link_position) {
        creep.memory.occupied_link_position = availablePositions.pop();
        assignedPosition = new RoomPosition(
            creep.memory.occupied_link_position.roomPosition.x,
            creep.memory.occupied_link_position.roomPosition.y,
            creep.memory.occupied_link_position.roomPosition.roomName
        );
        Memory.rooms[creep.room.name].unoccupied_link_positions = availablePositions;
    } else {
        assignedPosition = new RoomPosition(
            creep.memory.occupied_link_position.roomPosition.x,
            creep.memory.occupied_link_position.roomPosition.y,
            creep.memory.occupied_link_position.roomPosition.roomName
        );
    }

    if (creep.pos.isEqualTo(assignedPosition)) {
        let loadLink: Link = <Link> structureManager.getLink(creep.room, "load");
        let unloadLink: Link = <Link> structureManager.getLink(creep.room, "unload");

        if (creep.memory.occupied_link_position.type === "load") {
            let targetSource: Resource = creep.pos.findClosestByPath<Resource>(FIND_DROPPED_RESOURCES, {
                filter: (resource: Resource) => {
                    return resource.amount > 50;
                },
            });

            creep.pickup(targetSource);
            creep.transfer(loadLink, RESOURCE_ENERGY);

            if (loadLink.energy === loadLink.energyCapacity && loadLink.cooldown === 0) {
                loadLink.transferEnergy(unloadLink);
            }
        } else {
            creep.withdraw(unloadLink, RESOURCE_ENERGY);
            creep.transfer(structureManager.getStorage(creep.room), RESOURCE_ENERGY);
        }
    } else {
        creepActions.moveTo(creep, assignedPosition);
    }
}
