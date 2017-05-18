/**
 * Iterates through a room and check its job entries for out-of-bounds objects.
 *
 * @export
 * @param {Room} room The current room.
 */
export function refreshRoomState(room: Room) {
    // Check if the `gateClosed` memory object is null
    if (!Memory.rooms[room.name].gateClosed) {
        Memory.rooms[room.name].gateClosed = false;
    }
}
