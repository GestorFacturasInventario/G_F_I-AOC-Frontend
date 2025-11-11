import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { UsuariosService, Usuario } from '../../services/usuarios.service';
import { SearchService } from '../../services/serchbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;

  //Datos del formulario
  nombre: string = '';
  correo: string = '';

  //Estado
  cargando: boolean = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' = 'success';

  private searchSubscription?: Subscription;

  constructor(
    private usuariosService: UsuariosService, 
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
      this.cargarUsuarios();

      this.searchSubscription = this.searchService.searchQuery$.subscribe(query => {
        this.filtrarUsuarios(query);
      })
  }

  ngOnDestroy(): void {
    this.searchService.clearSearch();
    this.searchSubscription?.unsubscribe();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = this.usuarios;

        const currentQuery = this.searchService.getCurrentQuery();
        if (currentQuery) {
          this.filtrarUsuarios(currentQuery);
        }
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
        this.mostrarMensaje('Error al cargar usuarios', 'error');
        this.cargando = false;
      }
    });
  }

  filtrarUsuarios(query: string): void {
    if (!query || !query.trim()) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }
  
    const queryLower = query.toLowerCase().trim();
    
    this.usuariosFiltrados = this.usuarios.filter(usuario => {

      return usuario.nombre && usuario.nombre.toLowerCase().includes(queryLower);
    });
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.nombre = usuario.nombre || '';
    this.correo = usuario.correo || '';
  }

  limpiarFormulario(): void {
    this.usuarioSeleccionado = null;
    this.nombre = '';
    this.correo = '';
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

  validarFormulario(): boolean {
    if (!this.nombre || !this.nombre.trim()) {
      this.mostrarMensaje('El nombre es obligatorio', 'error');
      return false;
    }
    if (!this.correo || !this.correo.trim()) {
      this.mostrarMensaje('El correo es obligatorio', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.mostrarMensaje('El correo no es valido', 'error');
      return false;
    }
    return true;
  }

  guardarUsuario(): void {
    if (!this.validarFormulario()) return;

    this.cargando = true;
    const datosUsuario = {
      correo: this.correo,
      nombre: this.nombre
    };

    if (this.usuarioSeleccionado) {
      // Metodo por si se va a actualizar
      this.usuariosService.actualizarUsuario(this.usuarioSeleccionado._id!, datosUsuario).subscribe({
        next: (usuario) => {
          this.mostrarMensaje('Usuario actualizado correctamente', 'success');
          this.cargarUsuarios();
          this.limpiarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar usuarios: ', error);
          this.mostrarMensaje('Error al actualizar usuarios', 'error');
          this.cargando = false;
        }
      });
    } else {
      // Metodo por si se va a crear
      this.usuariosService.crearUsuario(datosUsuario).subscribe({
        next: () => {
          this.mostrarMensaje('Usuario agregado correctamente', 'success');
          this.cargarUsuarios();
          this.limpiarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear usuario: ', error);
          this.mostrarMensaje('Error al crear usuario', 'error');
          this.cargando = false;
        }
      });
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    if (!confirm(`¿Estás seguro de querer eliminar al usuario ${usuario.nombre}?`)) return;

    this.cargando = true;
    this.usuariosService.eliminarUsuario(usuario._id!).subscribe({ 
      next: () => {
        this.mostrarMensaje('Usuario eliminado correctamente', 'success');
        this.cargarUsuarios();
        if (this.usuarioSeleccionado?._id === usuario._id) {
          this.limpiarFormulario();
        }
      },
      error: (error) => {
        console.error('Error al eliminar usuario: ', error);
        this.mostrarMensaje('Error al eliminar usuario', 'error');
        this.cargando = false;
      }
    });
  }

  get textoBoton(): string {
    return this.usuarioSeleccionado ? 'Actualizar' : 'Agregar';
  }
}