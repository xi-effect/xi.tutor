# Карта черновика пользовательской документации

Корневая папка: `docs/new-draft/`.  
Файлы — **MDX** с минимальным `frontmatter` (`title`, `description`) и каркасом разделов; в теле везде, где шаги зависят от интерфейса, в начале стоит комментарий `<!-- TODO: Требует ручной проверки по UI -->` (см. отдельную колонку ниже).

При переносе в репозиторий Fumadocs относительные ссылки между статьями можно привести к соглашениям того проекта (например, убрать `.mdx` в хвосте).

| Путь к файлу                                                               | Русский заголовок (как в `title`)                                         | Краткая цель                          | Ручная проверка по UI |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------- | --------------------- |
| `docs-draft/01-getting-started/index.mdx`                                  | Начало работы                                                             | Обзор раздела, навигация к подстатьям | Нет — написано        |
| `docs-draft/01-getting-started/register.mdx`                               | Как зарегистрироваться                                                    | Создать учётную запись                | Нет — написано        |
| `docs-draft/01-getting-started/sign-in.mdx`                                | Как войти в сервис                                                        | Войти в существующий аккаунт          | Нет — написано        |
| `docs-draft/01-getting-started/reset-password.mdx`                         | Как восстановить пароль, если забыли                                      | Запрос сброса и новый пароль          | Нет — написано        |
| `docs-draft/01-getting-started/confirm-email.mdx`                          | Как подтвердить почту                                                     | Подтвердить адрес письмом/ссылкой     | Нет — написано        |
| `docs-draft/01-getting-started/first-run-after-login.mdx`                  | Первый вход: анкета, роль, мессенджеры, почта                             | Мастер после регистрации              | Нет — написано        |
| `docs-draft/02-classrooms/index.mdx`                                       | Кабинеты и приглашения                                                    | Обзор раздела                         | Да                    |
| `docs-draft/02-classrooms/tutor-and-student.mdx`                           | Чем репетитор отличается от ученика                                       | Сравнение ролей и меню                | Да                    |
| `docs-draft/02-classrooms/classroom-list.mdx`                              | Список кабинетов: как им пользоваться                                     | Карточки, переход в кабинет           | Да                    |
| `docs-draft/02-classrooms/invite-tutor-flow.mdx`                           | Как пригласить ученика                                                    | Ссылка-приглашение, отправка          | Да                    |
| `docs-draft/02-classrooms/create-group.mdx`                                | Как создать группу                                                        | Новый групповой кабинет               | Да                    |
| `docs-draft/02-classrooms/accept-invite.mdx`                               | Как принять приглашение и зайти в кабинет                                 | Сценарий по ссылке                    | Да                    |
| `docs-draft/02-classrooms/classroom-tabs.mdx`                              | Кабинет открыт: вкладки и чем каждая отличается                           | Навигация по кабинету                 | Да                    |
| `docs-draft/02-classrooms/group-classroom-manage.mdx`                      | Групповой кабинет: добавить ученика, пригласить в группу, удалить кабинет | Управление группой (репетитор)        | Да                    |
| `docs-draft/02-classrooms/student-material-access.mdx`                     | Как выдать ученику доступ к материалам                                    | Режимы просмотра/редактирования       | Да                    |
| `docs-draft/03-lessons-and-schedule/index.mdx`                             | Уроки и расписание                                                        | Обзор раздела                         | Да                    |
| `docs-draft/03-lessons-and-schedule/home-dashboard.mdx`                    | Главная: что вверху, баннер, ближайший урок                               | Обзор главной, баннер                 | Да                    |
| `docs-draft/03-lessons-and-schedule/schedule-overview.mdx`                 | Уроки в одном месте: страница «Расписание»                                | Обзор экрана календаря                | Да                    |
| `docs-draft/03-lessons-and-schedule/create-move-lesson.mdx`                | Как поставить урок, перенести или сменить время                           | Создание и перенос из двух мест       | Да                    |
| `docs-draft/04-board-and-notes/index.mdx`                                  | Доска и конспекты                                                         | Обзор раздела                         | Да                    |
| `docs-draft/04-board-and-notes/where-are-boards.mdx`                       | Где лежат доски и конспекты                                               | Материалы, вкладки                    | Да                    |
| `docs-draft/04-board-and-notes/open-board-from-materials-or-classroom.mdx` | Как открыть доску или конспект                                            | Один сценарий, два входа              | Да                    |
| `docs-draft/04-board-and-notes/board-drawing-and-text.mdx`                 | Рисунок, рука, текст и фигуры на доске                                    | Инструменты рисования                 | Да                    |
| `docs-draft/04-board-and-notes/board-attachments-pdf-image-audio.mdx`      | Что прикрепить к уроку на доске: PDF, картинка, звук                      | Вложения на доску                     | Да                    |
| `docs-draft/04-board-and-notes/board-during-call.mdx`                      | Доска во время видеоурока                                                 | Кнопка доски в эфире, возврат         | Да                    |
| `docs-draft/05-video-lesson/index.mdx`                                     | Видеоурок                                                                 | Обзор раздела                         | Да                    |
| `docs-draft/05-video-lesson/prejoin-devices.mdx`                           | Перед уроком: ожидание, камера, микрофон                                  | Экран ожидания, устройства            | Да                    |
| `docs-draft/05-video-lesson/during-call-screen-chat.mdx`                   | Во время урока: кто в кадре, демонстрация экрана, чат, рука               | Панель в эфире                        | Да                    |
| `docs-draft/05-video-lesson/compact-mode-while-browsing.mdx`               | Урок в маленьком окне, когда вы в другом разделе                          | Компактный режим                      | Да                    |
| `docs-draft/05-video-lesson/background-blur.mdx`                           | Размытие фона в видео                                                     | Настройка фона, если доступна         | Да                    |
| `docs-draft/06-payments/index.mdx`                                         | Счета и оплаты                                                            | Обзор раздела                         | Да                    |
| `docs-draft/06-payments/payments-page-tabs.mdx`                            | Страница «Оплаты» и её вкладки                                            | Вкладки, списки                       | Да                    |
| `docs-draft/06-payments/create-invoice.mdx`                                | Как выставить счёт и отправить ученику                                    | Счёт с общей страницы и из кабинета   | Да                    |
| `docs-draft/06-payments/approve-incoming-payment.mdx`                      | Как согласовать оплату по счёту                                           | Экран одобрения, роли                 | Да                    |
| `docs-draft/07-profile-settings/index.mdx`                                 | Профиль и настройки                                                       | Обзор раздела                         | Да                    |
| `docs-draft/07-profile-settings/personal-and-role.mdx`                     | Личные данные, имя, смена роли                                            | Карточка и роль                       | Да                    |
| `docs-draft/07-profile-settings/email-and-password.mdx`                    | Почта и пароль                                                            | Безопасность входа                    | Да                    |
| `docs-draft/07-profile-settings/notifications-bell-and-settings.mdx`       | Уведомления: колокол вверху и настройки в профиле                         | Два места, одна статья                | Да                    |
| `docs-draft/07-profile-settings/effects-sound.mdx`                         | Звук на уроке: раздел «Эффекты»                                           | Настройки эффектов                    | Да                    |
| `docs-draft/07-profile-settings/report.mdx`                                | Отчёт                                                                     | Раздел «Отчёт» в настройках           | Да                    |
| `docs-draft/08-install-tips-and-help/index.mdx`                            | Установка, подсказки и помощь                                             | Обзор раздела                         | Да                    |
| `docs-draft/08-install-tips-and-help/install-pwa.mdx`                      | Как установить приложение                                                 | PWA / ярлык                           | Да                    |
| `docs-draft/08-install-tips-and-help/hints-tour-again.mdx`                 | Подсказки по кнопкам: как включить тур снова                              | Повтор обучающих подсказок            | Да                    |
| `docs-draft/08-install-tips-and-help/knowledge-base-external.mdx`          | База знаний на сайте                                                      | Внешняя справка                       | Да                    |
| `docs-draft/08-install-tips-and-help/contact-support.mdx`                  | Написать в поддержку                                                      | Каналы и окно                         | Да                    |
| `docs-draft/09-troubleshooting/index.mdx`                                  | Если что-то не работает                                                   | Оглавление неполадок                  | Да                    |
| `docs-draft/09-troubleshooting/call-no-video-audio.mdx`                    | Звонок: нет видео, звука или нельзя выбрать устройства                    | Диагностика эфира                     | Да                    |
| `docs-draft/09-troubleshooting/payment-link-issues.mdx`                    | Оплата: счёт не открылся по ссылке из письма                              | Ссылка, вход, ручной открытие         | Да                    |
| `docs-draft/09-troubleshooting/email-confirmation-missing.mdx`             | Почта: письмо с подтверждением не пришло                                  | Спам, повтор, опечатка                | Да                    |
| `docs-draft/09-troubleshooting/board-file-not-loading.mdx`                 | Доска: не грузятся картинка, PDF или звук                                 | Формат, размер, сеть                  | Да                    |

**Про колонку «Ручная проверка»:** для черновика отмечено **Да** для всех перечисленных статей: тексты-заготовки не снимали с готовой версии продукта. Статусы **Нет** можно выставлять в целевом репозитории после ревью и публикации.

**Итого:** 50 MDX-файлов, без сгенерированного `meta.json` — см. [структуру плана](docs/структура-пользовательской-документации.md).
