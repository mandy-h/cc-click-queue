import { handleQueueUpdate } from './ce-do-core.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock functions for dependency injection
const mockExtensionStorage = {
  get: vi.fn(),
  set: vi.fn()
};
const mockRenderLevelProgress = vi.fn();
const mockSwitchToNextAdoptable = vi.fn();


describe('Tests for functions in ce-do-core.js content script', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleQueueUpdate', () => {
    it('should update the queue and navigate to the next adoptable when the current level is greater than or equal to the target level', async () => {
      // Mock test data
      const queue = [
        { id: 1, target: 30 },
        { id: 2, target: 30 },
        { id: 3, target: 30 },
      ];
      const currentLevel = 30;
      mockExtensionStorage.get.mockReturnValue({ queue });

      // Call the function with mock data and dependencies
      await handleQueueUpdate(currentLevel, mockExtensionStorage, mockRenderLevelProgress, mockSwitchToNextAdoptable);

      // Check that the first adoptable in the queue was removed
      expect(mockExtensionStorage.set).toHaveBeenCalledWith(
        {
          queue: [
            { id: 2, target: 30 },
            { id: 3, target: 30 },
          ]
        }
      );
      // Check that switchToNextAdoptable was called with the next adoptable ID in the queue
      expect(mockSwitchToNextAdoptable).toHaveBeenCalledWith(2);
    });

    it('should not update the queue if the current level is less than the target level', async () => {
      // Mock test data
      const queue = [
        { id: 1, target: 30 },
      ];
      const currentLevel = 10;
      mockExtensionStorage.get.mockReturnValue({ queue });

      // Call the function with mock data and dependencies
      await handleQueueUpdate(currentLevel, mockExtensionStorage, mockRenderLevelProgress, mockSwitchToNextAdoptable);

      // Check that the queue was not updated
      expect(mockExtensionStorage.set).not.toHaveBeenCalled();
    });

    it('should navigate to the "done" page when the queue is empty', async () => {
      // Mock test data
      const queue = [
        { id: 1, target: 30 },
      ];
      const currentLevel = 30;
      mockExtensionStorage.get.mockReturnValue({ queue });

      // Call the function with mock data and dependencies
      await handleQueueUpdate(currentLevel, mockExtensionStorage, mockRenderLevelProgress, mockSwitchToNextAdoptable);

      // Check that the queue is empty
      expect(mockExtensionStorage.set).toHaveBeenCalledWith({ queue: [] });
      // Check that the window location was set to the "done" page
      expect(window.location).toContain('?act=choose#done');
    });
  });
});