package com.noontrop.app

import android.content.Context
import android.net.wifi.p2p.WifiP2pDevice
import android.net.wifi.p2p.WifiP2pManager
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceInfo
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceRequest
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.HashMap
import kotlin.concurrent.thread

class WifiP2PModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var manager: WifiP2pManager? = null
    private var channel: WifiP2pManager.Channel? = null
    private var serviceRequest: WifiP2pDnsSdServiceRequest? = null
    private var localServiceInfo: WifiP2pDnsSdServiceInfo? = null
    private var serverSocket: ServerSocket? = null
    private val PORT = 8888
    private val SERVICE_TYPE = "_noontrop._tcp"

    override fun getName(): String {
        return "WifiP2PModule"
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            manager = reactContext.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
            if (manager == null) {
                promise.reject("UNAVAILABLE", "Wi-Fi Direct is not supported on this device")
                return
            }

            channel = manager?.initialize(reactContext, reactContext.mainLooper, null)

            // Setup DNS-SD listeners
            setupServiceListeners()

            // Start listening server socket for direct offline P2P frames
            startServerSocket()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.localizedMessage, e)
        }
    }

    private fun setupServiceListeners() {
        val txtRecordListener = WifiP2pManager.DnsSdTxtRecordListener { fullDomain, record, device ->
            val params = Arguments.createMap().apply {
                putString("peerId", record["id"] ?: device.deviceAddress)
                putString("deviceName", record["name"] ?: device.deviceName)
                putString("publicKey", record["pubKey"] ?: "")
                putString("avatarColor", record["color"] ?: "#00E5FF")
                putInt("signalStrength", 85)
                putString("status", "nearby")
            }
            sendEvent("onPeerDiscovered", params)
        }

        val serviceResponseListener = WifiP2pManager.DnsSdServiceResponseListener { instanceName, registrationType, resourceType ->
            // Service found
        }

        manager?.setDnsSdResponseListeners(channel, serviceResponseListener, txtRecordListener)
    }

    @ReactMethod
    fun startAdvertising(serviceName: String, txtRecordMap: ReadableMap, promise: Promise) {
        val record = HashMap<String, String>()
        val iterator = txtRecordMap.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            record[key] = txtRecordMap.getString(key) ?: ""
        }

        localServiceInfo = WifiP2pDnsSdServiceInfo.newInstance(serviceName, SERVICE_TYPE, record)

        manager?.addLocalService(channel, localServiceInfo, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                promise.resolve(true)
            }

            override fun onFailure(code: Int) {
                promise.reject("ADVERTISE_FAILED", "Failed to add local service. Code: $code")
            }
        })
    }

    @ReactMethod
    fun stopAdvertising(promise: Promise) {
        if (localServiceInfo != null) {
            manager?.removeLocalService(channel, localServiceInfo, object : WifiP2pManager.ActionListener {
                override fun onSuccess() {
                    localServiceInfo = null
                    promise.resolve(true)
                }

                override fun onFailure(code: Int) {
                    promise.reject("REMOVE_SERVICE_FAILED", "Code: $code")
                }
            })
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun startDiscovery(promise: Promise) {
        serviceRequest = WifiP2pDnsSdServiceRequest.newInstance()
        manager?.addServiceRequest(channel, serviceRequest, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                manager?.discoverServices(channel, object : WifiP2pManager.ActionListener {
                    override fun onSuccess() {
                        promise.resolve(true)
                    }

                    override fun onFailure(code: Int) {
                        promise.reject("DISCOVER_FAILED", "Code: $code")
                    }
                })
            }

            override fun onFailure(code: Int) {
                promise.reject("ADD_REQUEST_FAILED", "Code: $code")
            }
        })
    }

    @ReactMethod
    fun stopDiscovery(promise: Promise) {
        if (serviceRequest != null) {
            manager?.removeServiceRequest(channel, serviceRequest, null)
        }
        manager?.stopPeerDiscovery(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                promise.resolve(true)
            }

            override fun onFailure(code: Int) {
                promise.resolve(false)
            }
        })
    }

    @ReactMethod
    fun sendMessage(peerAddress: String, payload: String, promise: Promise) {
        thread {
            try {
                val socket = Socket()
                socket.bind(null)
                socket.connect(InetSocketAddress(peerAddress, PORT), 5000)
                val outputStream: OutputStream = socket.getOutputStream()
                outputStream.write(payload.toByteArray(Charsets.UTF_8))
                outputStream.flush()
                socket.close()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SEND_FAILED", e.localizedMessage, e)
            }
        }
    }

    private fun startServerSocket() {
        thread {
            try {
                serverSocket = ServerSocket(PORT)
                while (!serverSocket!!.isClosed) {
                    val client = serverSocket!!.accept()
                    val inputStream = client.getInputStream()
                    val buffer = ByteArray(4096)
                    val bytesRead = inputStream.read(buffer)
                    if (bytesRead > 0) {
                        val messageJson = String(buffer, 0, bytesRead, Charsets.UTF_8)
                        val params = Arguments.createMap().apply {
                            putString("payload", messageJson)
                            putDouble("timestamp", System.currentTimeMillis().toDouble())
                        }
                        sendEvent("onMessageReceived", params)
                    }
                    client.close()
                }
            } catch (e: Exception) {
                // Server socket closed
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep for NativeEventEmitter support
    }

    @ReactMethod
    fun removeListeners(count: Double) {
        // Keep for NativeEventEmitter support
    }
}
