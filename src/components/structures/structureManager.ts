import * as Config from "../../config/config";
import { log } from "../../utils/log";

export let links: Link[];

/**
 * Loads all the available structures within a room.
 *
 * @export
 * @param {Room} room The current room.
 * @returns {Structure[]} an array of structures inside the room
 */
export function loadStructures(room: Room): Structure[] {
    return room.find<Structure>(FIND_STRUCTURES);
}

/**
 * Gets the number of structures available in the room.
 *
 * @export
 * @param {Room} room
 * @returns {number} the number of structures available in the room
 */
export function getStructureCount(room: Room): number {
    let structureCount: number = _.size(room.find<Structure>(FIND_STRUCTURES));

    if (Config.ENABLE_DEBUG_MODE) {
        log.debug("[StructureManager]", structureCount + " structures in room.");
    }

    return structureCount;
}

/**
 * Gets the first spawn in the room.
 *
 * @export
 * @param {Room} room
 * @returns {StructureSpawn} the first spawn in the room
 */
export function getSpawn(room: Room): StructureSpawn {
    let spawn: StructureSpawn[] = room.find<StructureSpawn>(FIND_MY_STRUCTURES);

    return spawn[0];
}

/**
 * Get the first storage object available. This prioritizes StructureContainer,
 * but will fall back to an extension, or to the spawn if need be.
 *
 * @export
 * @param {Structure[]} structures The list of structures to filter.
 * @returns {Structure} the desired structure.
 */
export function getStorageObject(structures: Structure[]): Structure {
    let targets: Structure[] = structures.filter((structure: StructureContainer) => {
        return ((structure.structureType === STRUCTURE_CONTAINER)
            && _.sum(structure.store) < structure.storeCapacity);
    });

    // if we can't find any storage containers, use either the extension or spawn.
    if (targets.length === 0) {
        targets = structures.filter((structure: StructureExtension) => {
            return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity);
        });
    }

    return targets[0];
}

/**
 * Get the first storage structure available. 
 *
 * @export
 * @returns {Storage} the desired structure.
 */
export function getStorage(room: Room): Storage {
    let storage: Storage[] = room.find<Storage>(FIND_MY_STRUCTURES, {
        filter: (s: Storage) => {
            return s.structureType === STRUCTURE_STORAGE;
        },
    });

    return storage[0];
 }

/**
 * Get a link type 
 *
 * @export
 * @returns {Link} the desired structure.
 */
export function getLink(room: Room, type: string): Link | null {
    let result: Link | null = null;
    let myLinks: Link[] = room.find<Link>(FIND_MY_STRUCTURES, {
        filter: (l: Link) => {
            return l.structureType === STRUCTURE_LINK;
        },
    });

    myLinks.forEach((link: Link) => {
        let a = Memory.rooms[room.name].links;
        if (type === "load") {
            for (let i: number = 0; i < a.length; i++) {
                if (a[i].load !== undefined && a[i].load === link.id) {
                    result = link;
                }
            }
        } else if (type === "unload") {
            for (let i: number = 0; i < a.length; i++) {
                if (a[i].unload !== undefined && a[i].unload === link.id) {
                    result = link;
                }
            }
        }
    });

    return result;
}

/**
 * Get the first energy dropoff point available. This prioritizes the spawn,
 * falling back on extensions, then towers, and finally containers.
 *
 * @export
 * @param {Structure[]} structures The list of structures to filter.
 * @returns {Structure} the desired structure.
 */
export function getDropOffPoint(structures: Structure[]): Structure {
    let targets: Structure[] = structures.filter((structure) => {
        if (structure instanceof Spawn) {
            return ((structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity);
        }
    });

    // If the spawn is full, we'll find any extensions.
    if (targets.length === 0) {
        targets = structures.filter((structure) => {
            if (structure instanceof StructureExtension) {
                return ((structure.structureType === STRUCTURE_EXTENSION)
                    && structure.energy < structure.energyCapacity);
            }
        });
    }

    // Or if that's filled as well, look for towers.
    if (targets.length === 0) {
        targets = structures.filter((structure: StructureTower) => {
            return ((structure.structureType === STRUCTURE_TOWER)
                && structure.energy < structure.energyCapacity);
        });
    }

    // Or if that's filled as well, look for containers.
    if (targets.length === 0) {
        targets = structures.filter((structure: StructureContainer) => {
            return ((structure.structureType === STRUCTURE_CONTAINER) &&
                _.sum(structure.store) < structure.storeCapacity);
        });
    }

    // Otherwise, look for storage containers.
    if (targets.length === 0) {
        targets = structures.filter((structure: StructureStorage) => {
            return ((structure.structureType === STRUCTURE_STORAGE) &&
                _.sum(structure.store) < structure.storeCapacity);
        });
    }
    return targets[0];
}

/**
 * Refresh the available links, without a linker creep next to it.
 *
 * @export
 * @param {Room} room
 */
export function refreshAvailableLinks(room: Room) {
    links = room.find<Link>(FIND_MY_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType === STRUCTURE_LINK;
        },
    });

    if (Memory.rooms[room.name].unoccupied_link_positions.length === 0) {
      links.forEach((link: Link) => {
          // get an array of all adjacent creeps near the link
          let lookResults = link.room.lookForAtArea(
              LOOK_TERRAIN,
              link.pos.y - 1,
              link.pos.x - 1,
              link.pos.y + 1,
              link.pos.x + 1,
              true
          );

          for (let result of <LookAtResultWithPos[]> lookResults) {
              // spot taken
              if (result.creep !== undefined && result.creep.memory.role === "linker") {
                  continue;
              } else {
                  // add positions in between and perpendicular to the link and the storage
                  let position: RoomPosition = new RoomPosition(result.x, result.y, room.name);
                  let storage: Storage = getStorage(room);
                  if (position.isNearTo(storage) && (
                      position.getDirectionTo(storage) === TOP ||
                      position.getDirectionTo(storage) === BOTTOM ||
                      position.getDirectionTo(storage) === LEFT ||
                      position.getDirectionTo(storage) === RIGHT)) {
                      Memory.rooms[room.name].unoccupied_link_positions.push({
                          linkId: link.id,
                          roomPosition: position,
                          type: "unload",
                      });
                      if (Memory.rooms[room.name].links.length < links.length) {
                          Memory.rooms[room.name].links.push({ unload: link.id });
                      }
                  }

                  // get miners
                  let creeps: Creep[] = room.find<Creep>(FIND_CREEPS, {
                      filter: (c: Creep) => {
                          return c.memory.role === "sourceMiner";
                      },
                  });

                  // add positions in between and perpendicular to the link and a sourceMiner
                  for (let cr of creeps) {
                      if (position.isNearTo(cr) && (
                          position.getDirectionTo(cr) === TOP ||
                          position.getDirectionTo(cr) === BOTTOM ||
                          position.getDirectionTo(cr) === LEFT ||
                          position.getDirectionTo(cr) === RIGHT)) {
                          Memory.rooms[room.name].unoccupied_link_positions.push({
                              linkId: link.id,
                              roomPosition: position,
                              type: "load",
                          });
                          if (Memory.rooms[room.name].links.length < links.length) {
                              Memory.rooms[room.name].links.push({ load: link.id });
                          }
                      }
                  }
              }
          }
      });
    }
}
