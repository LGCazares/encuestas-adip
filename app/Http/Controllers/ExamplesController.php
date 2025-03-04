<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ExamplesController extends Controller
{
    public function uploadFile(Request $r){
        if($r->hasFile('biArchivo')){
            $public = isset($r->chkPublic) && $r->chkPublic == 1;
            $sendMailWithFile = isset($r->chkSendMail) && $r->chkSendMail == 1;
            $saved = FileService::store($r->file('biArchivo'), $public);
            /* Envía como archivo adjunto un archivo cargado por el usuario */
            if($sendMailWithFile){
                // Ejemplo 1: Con lista de correo (deberá haber cron que ejecute los envíos)
                $korreo = new Correo([
                    'tx_from' => config('mail.from.adderss', 'no-reply@cdmx.gob.mx')
                    ,'tx_to' => 'underdog1987@yandex.ru'
                    ,'tx_subject' => 'Prueba de archivo adjunto'
                    ,'tx_body' => 'Kindly check the attached loveletter comming from me'
                    ,'nu_priority' => 0        
                ]);
                $korreo->save();
                $korreo->archivos()->attach($saved->id);
                // Ejemplo 2: Con MailFactory (envío al vuelo)
                // $korreo = new Correo([
                //     'tx_from' => config('mail.from.adderss', 'no-reply@cdmx.gob.mx')
                //     ,'tx_to' => 'underdog1987@yandex.ru'
                //     ,'tx_subject' => 'Prueba de archivo adjunto'
                //     ,'tx_body' => 'Kindly check the attached loveletter comming from me'
                //     ,'nu_priority' => 0        
                // ]);
                // $korreo->save();
                // $korreo->archivos()->attach($saved->id);
                // $foo = MailFactory::sendMail($korreo);
            }
            return view('examples.file-uploaded')->with(compact('saved', 'public'));
        }
    }
}
