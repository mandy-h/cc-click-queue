import ExtensionStorage from '../ExtensionStorage.js';

export async function getQueue() {
  const result = await ExtensionStorage.get({ queue: [] });
  return result.queue;
}

export async function add(adoptableIds, targetLevel) {
  const queue = await getQueue();
  
  // Remove duplicate IDs from user input
  const uniqueIds = new Set(adoptableIds);

  // Filter out IDs that are already in the queue
  const ids = [];
  const duplicateIds = [];
  uniqueIds.forEach((id) => {
    const idIsInQueue = queue.findIndex((item) => item.id === id) > -1;
    if (idIsInQueue) {
      duplicateIds.push(id);
    } else {
      ids.push(id);
    }
  });

  // Add to queue
  ids.forEach((id) => {
    queue.push({
      id,
      target: targetLevel
    });
  });

  await ExtensionStorage.set({ queue });
}

export async function remove(id) {
  const queue = await getQueue();
  const updatedQueue = queue.filter((el) => el.id !== id);
  await ExtensionStorage.set({ queue: updatedQueue });
}

export async function clear() {
  await ExtensionStorage.set({ queue: [] });
}

export async function move(id, position) {
  const queue = await getQueue();
  const itemToMove = queue.find((el) => el.id === id);
  let updatedQueue;

  if (position === 'front') {
    updatedQueue = [itemToMove, ...queue.filter((el) => el.id !== id)];
  } else if (position === 'end') {
    updatedQueue = [...queue.filter((el) => el.id !== id), itemToMove];
  }

  await ExtensionStorage.set({ queue: updatedQueue });
}

export async function sort(param, order) {
  const queue = await getQueue();
  const sortedQueue = [...queue].sort((a, b) => {
    if (order === 'ascending') {
      return a[param] - b[param];
    } else if (order === 'descending') {
      return b[param] - a[param];
    }
  });
  await ExtensionStorage.set({ queue: sortedQueue });
}

export async function updateTargetLevel(id, newTarget) {
  const queue = await getQueue();
  const updatedQueue = queue.map((item) => 
    item.id === id ? { ...item, target: newTarget } : item
  );
  await ExtensionStorage.set({ queue: updatedQueue });
}

export async function updateAllTargetLevels(target) {
  const queue = await getQueue();
  const updatedQueue = queue.map(item => ({ 
    id: item.id, 
    target 
  }));
  await ExtensionStorage.set({ queue: updatedQueue });
} 