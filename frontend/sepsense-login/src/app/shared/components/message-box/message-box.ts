import { Component,input,output } from '@angular/core';

@Component({
  selector: 'app-message-box',
  imports: [],
  templateUrl: './message-box.html',
  styleUrl: './message-box.scss',
})
export class MessageBox {
tittle=input('confirmar accion');
message=input ("¿Estas seguro de realizar esta accion?"); 
confirmtext=input ("Confirmar"); 
canceltext=input('Cancelar');
//errorMessage=input('USUARIO O CONTRASEÑA INVALIDO');

confirm=output<void>(); 
cancel=output<void>();
}
