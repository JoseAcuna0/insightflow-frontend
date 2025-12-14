/**
 * DTO (Data Transfer Object) para la actualización de usuarios.
 * Define la estructura de datos permitida para modificar la información del perfil.
 * Se utiliza en operaciones de actualización parcial (PATCH), por lo que todos los campos son opcionales.
 */
export interface UserUpdateDto {
  /**
   * El nuevo nombre de usuario.
   * Si se omite, se conserva el valor actual en la base de datos.
   */
  username?: string;

  /**
   * El nuevo nombre completo del usuario.
   * Si se omite, se conserva el valor actual en la base de datos.
   */
  fullName?: string;
}