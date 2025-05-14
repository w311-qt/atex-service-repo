import { AppDataSource } from '../../ormconfig';
import { StatusSeed } from './status.seed';
import { CategorySeed } from './category.seed';
import { RequestStatusSeed } from './request-status.seed';
import { RequestTypeSeed } from './request-type.seed';
import { RequestPrioritySeed } from './request-priority.seed';
import { UserSeed } from './user.seed';

/**
 * Этот скрипт запускает все сиды для заполнения базы данных начальными данными
 * Порядок выполнения сидов важен из-за зависимостей между таблицами
 */
async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    await UserSeed(AppDataSource);
    await StatusSeed(AppDataSource);
    await CategorySeed(AppDataSource);
    await RequestStatusSeed(AppDataSource);
    await RequestTypeSeed(AppDataSource);
    await RequestPrioritySeed(AppDataSource);

    console.log('Seeds completed successfully!');
  } catch (error) {
    console.error('Error during seed execution:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

runSeed();
